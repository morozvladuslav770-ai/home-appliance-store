require "test_helper"

class Api::Admin::ReviewsControllerTest < ActionDispatch::IntegrationTest
  setup do
    order = Order.place(
      { customer_name: "Іван", email: "i@example.com", phone: "+380501234567", city: "Київ",
        delivery_method: "pickup", payment_method: "cash_on_delivery", user_id: users(:buyer).id },
      [ { product_id: products(:fridge).id, quantity: 1 } ]
    )
    %w[paid shipped delivered].each { |status| order.change_status!(status) }
    @review = Review.create!(user: users(:buyer), product: products(:fridge), rating: 1, body: "Неприйнятний зміст відгуку")
  end

  test "покупець не бачить і не видаляє відгуки в адмінці" do
    get api_admin_reviews_url, headers: auth_headers(users(:buyer))
    assert_response :forbidden

    assert_no_difference "Review.count" do
      delete api_admin_review_url(@review), headers: auth_headers(users(:buyer))
    end
    assert_response :forbidden
  end

  test "менеджер бачить список відгуків із автором і товаром" do
    get api_admin_reviews_url, headers: auth_headers(users(:manager))
    assert_response :success
    item = response.parsed_body.first
    assert_equal users(:buyer).email, item["email"]
    assert_equal products(:fridge).name, item.dig("product", "name")
  end

  test "менеджер видаляє відгук: рейтинг перераховується, дія потрапляє в журнал" do
    assert_difference "Review.count", -1 do
      delete api_admin_review_url(@review), headers: auth_headers(users(:manager))
    end
    assert_response :no_content

    assert_nil products(:fridge).reload.rating
    log = AuditLog.last
    assert_equal "review.destroy", log.action
    assert_equal users(:buyer).email, log.details["author"]
  end
end
