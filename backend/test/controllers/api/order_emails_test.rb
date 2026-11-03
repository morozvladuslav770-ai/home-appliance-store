require "test_helper"

class Api::OrderEmailsTest < ActionDispatch::IntegrationTest
  def attrs
    { customer_name: "Іван Петренко", email: "ivan@example.com", phone: "+380501234567", city: "Київ",
      delivery_method: "courier", address: "вул. Тестова, 1", payment_method: "cash_on_delivery" }
  end

  def place
    Order.place(attrs.merge(user_id: users(:buyer).id), [ { product_id: products(:fridge).id, quantity: 1 } ])
  end

  test "оформлення замовлення ставить у чергу лист підтвердження" do
    assert_enqueued_emails 1 do
      post api_orders_url,
           params: { order: attrs, items: [ { product_id: products(:fridge).id, quantity: 1 } ] },
           headers: auth_headers(users(:buyer)), as: :json
    end
    assert_response :created
  end

  test "невдале оформлення не надсилає листа" do
    assert_no_enqueued_emails do
      post api_orders_url, params: { order: attrs, items: [] }, headers: auth_headers(users(:buyer)), as: :json
    end
  end

  test "зміна статусу менеджером надсилає лист покупцю" do
    order = place
    assert_enqueued_emails 1 do
      patch api_admin_order_url(order), params: { status: "paid" },
            headers: auth_headers(users(:manager)), as: :json
    end
    assert_response :success
  end

  test "недопустимий перехід статусу не надсилає листа" do
    order = place
    assert_no_enqueued_emails do
      patch api_admin_order_url(order), params: { status: "delivered" },
            headers: auth_headers(users(:manager)), as: :json
    end
    assert_response :unprocessable_entity
  end

  test "скасування покупцем надсилає лист" do
    order = place
    assert_enqueued_emails 1 do
      patch cancel_api_order_url(order), headers: auth_headers(users(:buyer)), as: :json
    end
    assert_response :success
  end
end
