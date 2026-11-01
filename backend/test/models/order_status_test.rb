require "test_helper"

class OrderStatusTest < ActiveSupport::TestCase
  def place_order(product, quantity, payment: "cash_on_delivery")
    Order.place(
      { customer_name: "Іван", email: "ivan@example.com", phone: "+380501234567", city: "Київ",
        delivery_method: "courier", address: "вул. Тестова, 1", payment_method: payment,
        user_id: users(:buyer).id },
      [ { product_id: product.id, quantity: quantity } ]
    )
  end

  test "processing → paid → shipped → delivered" do
    order = place_order(products(:fridge), 1)
    assert order.change_status!("paid")
    assert order.change_status!("shipped")
    assert order.change_status!("delivered")
    assert order.reload.delivered?
  end

  test "заборонений перехід відхиляється" do
    order = place_order(products(:fridge), 1)
    assert_not order.change_status!("delivered")
    assert order.reload.processing?
  end

  test "з доставленого й скасованого переходів немає" do
    assert_empty Order::TRANSITIONS["delivered"]
    assert_empty Order::TRANSITIONS["cancelled"]
  end

  test "скасування менеджером повертає склад, навіть після оплати" do
    fridge = products(:fridge)
    order = place_order(fridge, 3)
    order.change_status!("paid")
    assert_equal 2, fridge.reload.stock_quantity

    assert order.change_status!("cancelled")
    assert_equal 5, fridge.reload.stock_quantity
  end

  test "відправлене замовлення скасувати не можна" do
    order = place_order(products(:fridge), 1)
    order.change_status!("shipped")
    assert_not order.change_status!("cancelled")
  end
end
