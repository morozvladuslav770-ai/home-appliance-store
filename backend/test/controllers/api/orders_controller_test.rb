require "test_helper"

class Api::OrdersControllerTest < ActionDispatch::IntegrationTest
  def order_attrs(overrides = {})
    {
      customer_name: "Іван Петренко",
      email: "ivan@example.com",
      phone: "+380501234567",
      city: "Івано-Франківськ",
      delivery_method: "courier",
      address: "вул. Незалежності, 1",
      payment_method: "cash_on_delivery"
    }.merge(overrides)
  end

  def post_order(items, overrides = {}, user: users(:buyer))
    post api_orders_url,
         params: { order: order_attrs(overrides), items: items },
         headers: user ? auth_headers(user) : {},
         as: :json
  end

  test "створює замовлення, рахує суму за цінами з бази та зменшує склад" do
    fridge = products(:fridge)

    assert_difference "Order.count", 1 do
      post_order([ { product_id: fridge.id, quantity: 2 } ])
    end

    assert_response :created
    body = response.parsed_body
    assert_equal "processing", body["status"]
    assert_equal fridge.price * 2, BigDecimal(body["total"].to_s)
    assert_equal 3, fridge.reload.stock_quantity
  end

  test "онлайн-оплата створює замовлення зі статусом «очікує оплати»" do
    post_order([ { product_id: products(:fridge).id, quantity: 1 } ], payment_method: "card_online")
    assert_response :created
    assert_equal "pending_payment", response.parsed_body["status"]
  end

  test "ігнорує ціну, надіслану клієнтом" do
    fridge = products(:fridge)
    post api_orders_url,
         params: { order: order_attrs, items: [ { product_id: fridge.id, quantity: 1, unit_price: 1 } ] },
         headers: auth_headers(users(:buyer)),
         as: :json
    assert_response :created
    assert_equal fridge.price, OrderItem.last.unit_price
  end

  test "відхиляє кількість більшу за склад і не змінює склад" do
    fridge = products(:fridge)
    assert_no_difference "Order.count" do
      post_order([ { product_id: fridge.id, quantity: 6 } ])
    end
    assert_response :unprocessable_entity
    assert_equal 5, fridge.reload.stock_quantity
  end

  test "відхиляє знятий з продажу товар" do
    assert_no_difference "Order.count" do
      post_order([ { product_id: products(:old_oven).id, quantity: 1 } ])
    end
    assert_response :unprocessable_entity
  end

  test "відхиляє порожній кошик" do
    post_order([])
    assert_response :unprocessable_entity
    assert_includes response.parsed_body["errors"]["base"], "Кошик порожній"
  end

  test "повертає помилки полів форми" do
    post_order([ { product_id: products(:fridge).id, quantity: 1 } ], email: "not-an-email", phone: "1")
    assert_response :unprocessable_entity
    errors = response.parsed_body["errors"]
    assert errors.key?("email")
    assert errors.key?("phone")
  end

  test "для самовивозу адреса не обов'язкова" do
    post_order([ { product_id: products(:fridge).id, quantity: 1 } ], delivery_method: "pickup", address: "")
    assert_response :created
  end

  test "товар під замовлення дозволяє замовити, склад не змінюється" do
    washer = products(:washer)
    post_order([ { product_id: washer.id, quantity: 3 } ])
    assert_response :created
    assert_equal 0, washer.reload.stock_quantity
  end

  test "коли склад вичерпано, товар стає «під замовлення»" do
    fridge = products(:fridge)
    post_order([ { product_id: fridge.id, quantity: 5 } ])
    assert_response :created
    assert_equal "on_order", fridge.reload.status
  end

  test "без входу замовлення не створюється" do
    assert_no_difference "Order.count" do
      post_order([ { product_id: products(:fridge).id, quantity: 1 } ], {}, user: nil)
    end
    assert_response :unauthorized
  end

  test "замовлення прив'язується до поточного користувача" do
    post_order([ { product_id: products(:fridge).id, quantity: 1 } ])
    assert_equal users(:buyer), Order.last.user
  end

  test "історія містить лише власні замовлення" do
    post_order([ { product_id: products(:fridge).id, quantity: 1 } ])
    post_order([ { product_id: products(:washer).id, quantity: 1 } ], {}, user: users(:other_buyer))

    get api_orders_url, headers: auth_headers(users(:buyer))
    assert_response :success
    assert_equal 1, response.parsed_body.size
    assert_equal users(:buyer).id, Order.find(response.parsed_body.first["id"]).user_id
  end

  test "історія потребує входу" do
    get api_orders_url
    assert_response :unauthorized
  end

  test "скасування повертає товар на склад" do
    fridge = products(:fridge)
    post_order([ { product_id: fridge.id, quantity: 5 } ])
    assert_equal "on_order", fridge.reload.status
    order_id = response.parsed_body["id"]

    patch cancel_api_order_url(order_id), headers: auth_headers(users(:buyer))
    assert_response :success
    assert_equal "cancelled", response.parsed_body["status"]
    assert_equal 5, fridge.reload.stock_quantity
    assert_equal "in_stock", fridge.status
  end

  test "скасування товару під замовлення не змінює склад" do
    washer = products(:washer)
    post_order([ { product_id: washer.id, quantity: 2 } ])
    patch cancel_api_order_url(response.parsed_body["id"]), headers: auth_headers(users(:buyer))
    assert_response :success
    assert_equal 0, washer.reload.stock_quantity
  end

  test "не можна скасувати після спливу часу" do
    post_order([ { product_id: products(:fridge).id, quantity: 1 } ])
    order_id = response.parsed_body["id"]

    travel 25.hours do
      patch cancel_api_order_url(order_id), headers: auth_headers(users(:buyer))
      assert_response :unprocessable_entity
    end
  end

  test "не можна скасувати чуже замовлення" do
    post_order([ { product_id: products(:fridge).id, quantity: 1 } ])
    patch cancel_api_order_url(response.parsed_body["id"]), headers: auth_headers(users(:other_buyer))
    assert_response :not_found
  end
end
