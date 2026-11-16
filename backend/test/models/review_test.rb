require "test_helper"

class ReviewTest < ActiveSupport::TestCase
  # Замовлення, доведене до статусу «Доставлено»
  def deliver!(user, product)
    order = Order.place(
      { customer_name: user.full_name, email: user.email, phone: "+380501234567", city: "Київ",
        delivery_method: "pickup", payment_method: "cash_on_delivery", user_id: user.id },
      [ { product_id: product.id, quantity: 1 } ]
    )
    %w[paid shipped delivered].each { |status| order.change_status!(status) }
    order
  end

  def review(user, rating: 5, body: "Чудовий холодильник, дуже задоволений")
    Review.new(user: user, product: products(:fridge), rating: rating, body: body)
  end

  test "без покупки відгук залишити не можна" do
    r = review(users(:buyer))
    assert_not r.valid?
    assert_includes r.errors[:base].join, "покупці"
  end

  test "замовлення, яке ще не доставлене, права на відгук не дає" do
    Order.place(
      { customer_name: "Іван", email: "i@example.com", phone: "+380501234567", city: "Київ",
        delivery_method: "pickup", payment_method: "cash_on_delivery", user_id: users(:buyer).id },
      [ { product_id: products(:fridge).id, quantity: 1 } ]
    )
    assert_not review(users(:buyer)).valid?
  end

  test "після доставки відгук можна залишити, але лише один на товар" do
    deliver!(users(:buyer), products(:fridge))

    assert review(users(:buyer)).save
    second = review(users(:buyer))
    assert_not second.valid?
    assert_includes second.errors[:product_id].join, "вже залишили"
  end

  test "оцінка від 1 до 5, текст не коротший за 10 символів" do
    deliver!(users(:buyer), products(:fridge))

    assert_not review(users(:buyer), rating: 0).valid?
    assert_not review(users(:buyer), rating: 6).valid?
    assert_not review(users(:buyer), body: "ок").valid?
    assert_not review(users(:buyer), body: "   ").valid?
  end

  test "покупка іншого товару права на відгук не дає" do
    deliver!(users(:buyer), products(:washer))
    assert_not review(users(:buyer)).valid?
  end

  test "рейтинг і кількість відгуків перераховуються при додаванні й видаленні" do
    deliver!(users(:buyer), products(:fridge))
    deliver!(users(:manager), products(:fridge))
    first = review(users(:buyer), rating: 5)
    second = review(users(:manager), rating: 4)
    first.save!
    second.save!

    product = products(:fridge).reload
    assert_equal 2, product.reviews_count
    assert_equal BigDecimal("4.5"), product.rating

    first.destroy
    assert_equal BigDecimal("4.0"), product.reload.rating
    assert_equal 1, product.reviews_count

    second.destroy
    assert_nil product.reload.rating
    assert_equal 0, product.reviews_count
  end

  test "зміна оцінки оновлює рейтинг" do
    deliver!(users(:buyer), products(:fridge))
    r = review(users(:buyer), rating: 5)
    r.save!
    r.update!(rating: 3)
    assert_equal BigDecimal("3.0"), products(:fridge).reload.rating
  end

  test "ім'я автора скорочується до ініціалу прізвища" do
    user = users(:buyer)
    user.update_columns(full_name: "Іван Петренко")
    assert_equal "Іван П.", Review.new(user: user).author_name
  end
end
