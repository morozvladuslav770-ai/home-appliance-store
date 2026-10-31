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

  def post_order(items, overrides = {})
    post api_orders_url, params: { order: order_attrs(overrides), items: items }, as: :json
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
end
