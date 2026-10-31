require "test_helper"

class OrderTest < ActiveSupport::TestCase
  def attrs
    {
      customer_name: "Іван", email: "ivan@example.com", phone: "+380501234567",
      city: "Київ", delivery_method: "courier", address: "вул. Тестова, 1",
      payment_method: "cash_on_delivery"
    }
  end

  test "place створює позиції зі знімком назви й ціни" do
    order = Order.place(attrs, [ { product_id: products(:fridge).id, quantity: 1 } ])
    assert order.persisted?
    item = order.order_items.first
    assert_equal products(:fridge).name, item.name
    assert_equal products(:fridge).price, item.unit_price
  end

  test "об'єднує повторні рядки одного товару" do
    id = products(:fridge).id
    order = Order.place(attrs, [ { product_id: id, quantity: 1 }, { product_id: id, quantity: 2 } ])
    assert_equal 1, order.order_items.size
    assert_equal 3, order.order_items.first.quantity
  end

  test "невідомий спосіб доставки дає помилку валідації" do
    order = Order.place(attrs.merge(delivery_method: "drone"), [ { product_id: products(:fridge).id, quantity: 1 } ])
    assert_not order.persisted?
    assert order.errors[:delivery_method].any?
  end

  test "рядки замовлення зберігаються разом із замовленням" do
    assert_difference "OrderItem.count", 1 do
      Order.place(attrs, [ { product_id: products(:fridge).id, quantity: 1 } ])
    end
  end
end
