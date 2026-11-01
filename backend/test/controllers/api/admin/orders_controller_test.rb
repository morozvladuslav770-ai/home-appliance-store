require "test_helper"

class Api::Admin::OrdersControllerTest < ActionDispatch::IntegrationTest
  def place_order(product, quantity = 1)
    Order.place(
      { customer_name: "Іван Петренко", email: "ivan@example.com", phone: "+380501234567", city: "Київ",
        delivery_method: "courier", address: "вул. Тестова, 1", payment_method: "cash_on_delivery",
        user_id: users(:buyer).id },
      [ { product_id: product.id, quantity: quantity } ]
    )
  end

  test "покупець не має доступу — 403" do
    get api_admin_orders_url, headers: auth_headers(users(:buyer))
    assert_response :forbidden
  end

  test "менеджер бачить усі замовлення з контактами клієнта" do
    place_order(products(:fridge))
    get api_admin_orders_url, headers: auth_headers(users(:manager))
    assert_response :success
    order = response.parsed_body.first
    assert_equal "+380501234567", order["phone"]
    assert_includes order["next_statuses"], "paid"
  end

  test "фільтр за статусом" do
    place_order(products(:fridge)).change_status!("paid")
    place_order(products(:washer))

    get api_admin_orders_url, params: { status: "paid" }, headers: auth_headers(users(:manager))
    assert_equal [ "paid" ], response.parsed_body.map { |o| o["status"] }.uniq
    assert_equal 1, response.parsed_body.size
  end

  test "пошук за ім'ям клієнта й номером" do
    order = place_order(products(:fridge))
    get api_admin_orders_url, params: { q: "петренко" }, headers: auth_headers(users(:manager))
    assert_equal 1, response.parsed_body.size

    get api_admin_orders_url, params: { q: order.id.to_s }, headers: auth_headers(users(:manager))
    assert_equal order.id, response.parsed_body.first["id"]
  end

  test "зміна статусу пишеться в журнал" do
    order = place_order(products(:fridge))
    patch api_admin_order_url(order), params: { status: "paid" }, headers: auth_headers(users(:manager)), as: :json
    assert_response :success
    assert_equal "paid", response.parsed_body["status"]

    log = AuditLog.last
    assert_equal "order.status", log.action
    assert_equal %w[processing paid], log.details["status"]
  end

  test "недопустимий перехід — 422 і без змін" do
    order = place_order(products(:fridge))
    assert_no_difference "AuditLog.count" do
      patch api_admin_order_url(order), params: { status: "delivered" }, headers: auth_headers(users(:manager)), as: :json
    end
    assert_response :unprocessable_entity
    assert order.reload.processing?
  end

  test "скасування менеджером повертає товар на склад" do
    fridge = products(:fridge)
    order = place_order(fridge, 2)
    patch api_admin_order_url(order), params: { status: "cancelled" }, headers: auth_headers(users(:manager)), as: :json
    assert_response :success
    assert_equal 5, fridge.reload.stock_quantity
  end

  test "покупець не може змінити статус" do
    order = place_order(products(:fridge))
    patch api_admin_order_url(order), params: { status: "paid" }, headers: auth_headers(users(:buyer)), as: :json
    assert_response :forbidden
  end
end
