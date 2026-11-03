require "test_helper"

class OrderMailerTest < ActionMailer::TestCase
  def build_order
    Order.place(
      { customer_name: "Іван Петренко", email: "ivan@example.com", phone: "+380501234567", city: "Київ",
        delivery_method: "courier", address: "вул. Тестова, 1", payment_method: "cash_on_delivery",
        user_id: users(:buyer).id },
      [ { product_id: products(:fridge).id, quantity: 2 } ]
    )
  end

  test "лист про нове замовлення йде на email із замовлення й містить склад та суму" do
    order = build_order
    mail = OrderMailer.confirmation(order)

    assert_equal [ "ivan@example.com" ], mail.to
    assert_includes mail.subject, "№#{order.id}"
    body = mail.body.to_s
    assert_includes body, products(:fridge).name
    assert_includes body, "2 ×"
    assert_includes body, "грн"
    assert_includes body, "/account"
  end

  test "лист про зміну статусу містить новий статус і пояснення" do
    order = build_order
    order.change_status!("paid")
    mail = OrderMailer.status_changed(order)

    assert_equal [ "ivan@example.com" ], mail.to
    assert_includes mail.body.to_s, "Оплачено"
    assert_includes mail.body.to_s, "Дякуємо за оплату"
  end
end
