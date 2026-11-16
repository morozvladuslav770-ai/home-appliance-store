require "test_helper"

class Api::ReviewsControllerTest < ActionDispatch::IntegrationTest
  def deliver!(user, product)
    order = Order.place(
      { customer_name: user.full_name, email: user.email, phone: "+380501234567", city: "Київ",
        delivery_method: "pickup", payment_method: "cash_on_delivery", user_id: user.id },
      [ { product_id: product.id, quantity: 1 } ]
    )
    %w[paid shipped delivered].each { |status| order.change_status!(status) }
  end

  def payload(rating: 5, body: "Чудовий холодильник, дуже задоволений")
    { review: { rating: rating, body: body } }
  end

  test "відгуки видно всім, гість отримує eligibility guest" do
    get api_product_reviews_url(products(:fridge))
    assert_response :success
    assert_equal [], response.parsed_body["reviews"]
    assert_equal "guest", response.parsed_body["eligibility"]
  end

  test "створення відгуку без входу — 401" do
    post api_product_reviews_url(products(:fridge)), params: payload, as: :json
    assert_response :unauthorized
  end

  test "без покупки — 422 з поясненням, eligibility not_purchased" do
    get api_product_reviews_url(products(:fridge)), headers: auth_headers(users(:buyer))
    assert_equal "not_purchased", response.parsed_body["eligibility"]

    post api_product_reviews_url(products(:fridge)), params: payload,
         headers: auth_headers(users(:buyer)), as: :json
    assert_response :unprocessable_entity
    assert_includes response.parsed_body.dig("errors", "base").join, "покупці"
  end

  test "покупець після доставки залишає відгук, публікується одразу й змінює рейтинг" do
    deliver!(users(:buyer), products(:fridge))

    get api_product_reviews_url(products(:fridge)), headers: auth_headers(users(:buyer))
    assert_equal "can_review", response.parsed_body["eligibility"]

    post api_product_reviews_url(products(:fridge)), params: payload(rating: 4),
         headers: auth_headers(users(:buyer)), as: :json
    assert_response :created
    assert_equal true, response.parsed_body["mine"]

    get api_product_reviews_url(products(:fridge)), headers: auth_headers(users(:buyer))
    assert_equal "reviewed", response.parsed_body["eligibility"]
    assert_equal 1, response.parsed_body["reviews"].size
    assert_equal BigDecimal("4.0"), products(:fridge).reload.rating
  end

  test "некоректна оцінка або короткий текст — 422 з помилками по полях" do
    deliver!(users(:buyer), products(:fridge))
    post api_product_reviews_url(products(:fridge)), params: payload(rating: 9, body: "ок"),
         headers: auth_headers(users(:buyer)), as: :json
    assert_response :unprocessable_entity
    assert response.parsed_body["errors"].key?("rating")
    assert response.parsed_body["errors"].key?("body")
  end

  test "автор редагує свій відгук, чужий відгук редагувати не можна" do
    deliver!(users(:buyer), products(:fridge))
    review = Review.create!(user: users(:buyer), product: products(:fridge), rating: 5, body: "Чудовий холодильник")

    patch api_review_url(review), params: payload(rating: 2, body: "Після місяця роботи розчарований"),
          headers: auth_headers(users(:buyer)), as: :json
    assert_response :success
    assert_equal 2, review.reload.rating

    patch api_review_url(review), params: payload(rating: 1, body: "Спроба змінити чужий відгук"),
          headers: auth_headers(users(:manager)), as: :json
    assert_response :not_found
    assert_equal 2, review.reload.rating
  end

  test "в публікації показується скорочене ім'я, а не email" do
    deliver!(users(:buyer), products(:fridge))
    users(:buyer).update_columns(full_name: "Іван Петренко")
    Review.create!(user: users(:buyer), product: products(:fridge), rating: 5, body: "Чудовий холодильник")

    get api_product_reviews_url(products(:fridge))
    review = response.parsed_body["reviews"].first
    assert_equal "Іван П.", review["author"]
    assert_equal false, review["mine"]
    assert_not_includes review.keys, "email"
  end
end
