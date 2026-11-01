require "test_helper"

class Api::PasswordResetsControllerTest < ActionDispatch::IntegrationTest
  test "для відомої адреси ставить лист у чергу" do
    assert_enqueued_emails 1 do
      post api_password_reset_url, params: { email: users(:buyer).email }, as: :json
    end
    assert_response :accepted
  end

  test "для невідомої адреси відповідь така сама, листа немає" do
    assert_no_enqueued_emails do
      post api_password_reset_url, params: { email: "nobody@example.com" }, as: :json
    end
    assert_response :accepted
  end

  test "змінює пароль за дійсним токеном" do
    user = users(:buyer)
    token = user.generate_token_for(:password_reset)

    patch api_password_reset_url,
          params: { token: token, password: "BrandNew123", password_confirmation: "BrandNew123" }, as: :json
    assert_response :no_content
    assert user.reload.authenticate("BrandNew123")
  end

  test "токен діє лише один раз" do
    token = users(:buyer).generate_token_for(:password_reset)
    patch api_password_reset_url,
          params: { token: token, password: "BrandNew123", password_confirmation: "BrandNew123" }, as: :json
    assert_response :no_content

    patch api_password_reset_url,
          params: { token: token, password: "Another123", password_confirmation: "Another123" }, as: :json
    assert_response :unprocessable_entity
  end

  test "токен спливає через 30 хвилин" do
    token = users(:buyer).generate_token_for(:password_reset)
    travel 31.minutes do
      patch api_password_reset_url,
            params: { token: token, password: "BrandNew123", password_confirmation: "BrandNew123" }, as: :json
      assert_response :unprocessable_entity
    end
  end

  test "слабкий пароль відхиляється" do
    token = users(:buyer).generate_token_for(:password_reset)
    patch api_password_reset_url, params: { token: token, password: "weak", password_confirmation: "weak" }, as: :json
    assert_response :unprocessable_entity
    assert response.parsed_body["errors"].key?("password")
  end

  test "скидання пароля знімає блокування й підтверджує email" do
    user = users(:unconfirmed)
    user.update_columns(locked_until: 10.minutes.from_now)
    token = user.generate_token_for(:password_reset)

    patch api_password_reset_url,
          params: { token: token, password: "BrandNew123", password_confirmation: "BrandNew123" }, as: :json
    assert_response :no_content
    assert_not user.reload.locked?
    assert user.email_confirmed?
  end
end
