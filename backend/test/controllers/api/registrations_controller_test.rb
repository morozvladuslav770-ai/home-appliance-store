require "test_helper"

class Api::RegistrationsControllerTest < ActionDispatch::IntegrationTest
  def attrs(overrides = {})
    {
      full_name: "Новий Користувач", email: "fresh@example.com", phone: "+380501234567",
      password: "Password1", password_confirmation: "Password1"
    }.merge(overrides)
  end

  test "реєструє покупця та ставить лист підтвердження в чергу" do
    assert_difference "User.count", 1 do
      assert_enqueued_emails 1 do
        post api_registration_url, params: { user: attrs }, as: :json
      end
    end
    assert_response :created
    user = User.find_by(email: "fresh@example.com")
    assert user.buyer?
    assert_not user.email_confirmed?
  end

  test "роль із параметрів ігнорується" do
    post api_registration_url, params: { user: attrs(role: "admin") }, as: :json
    assert_response :created
    assert User.find_by(email: "fresh@example.com").buyer?
  end

  test "відхиляє повторний email" do
    assert_no_difference "User.count" do
      post api_registration_url, params: { user: attrs(email: users(:buyer).email) }, as: :json
    end
    assert_response :unprocessable_entity
    assert response.parsed_body["errors"].key?("email")
  end

  test "відхиляє слабкий пароль" do
    post api_registration_url, params: { user: attrs(password: "abc", password_confirmation: "abc") }, as: :json
    assert_response :unprocessable_entity
    assert response.parsed_body["errors"].key?("password")
  end

  test "відхиляє розбіжність паролів" do
    post api_registration_url, params: { user: attrs(password_confirmation: "Different1") }, as: :json
    assert_response :unprocessable_entity
  end
end
