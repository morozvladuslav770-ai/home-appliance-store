require "test_helper"

class Api::ConfirmationsControllerTest < ActionDispatch::IntegrationTest
  test "підтверджує email за дійсним токеном" do
    user = users(:unconfirmed)
    post "/api/confirmation", params: { token: user.generate_token_for(:email_confirmation) }, as: :json
    assert_response :success
    assert user.reload.email_confirmed?
  end

  test "відхиляє недійсний токен" do
    post "/api/confirmation", params: { token: "garbage" }, as: :json
    assert_response :unprocessable_entity
  end

  test "відхиляє прострочений токен" do
    token = users(:unconfirmed).generate_token_for(:email_confirmation)
    travel 3.days do
      post "/api/confirmation", params: { token: token }, as: :json
      assert_response :unprocessable_entity
    end
  end

  test "повторне надсилання листа для непідтвердженого акаунта" do
    assert_enqueued_emails 1 do
      post "/api/confirmation/resend", params: { email: users(:unconfirmed).email }, as: :json
    end
    assert_response :accepted
  end

  test "повторне надсилання не розкриває, чи існує адреса" do
    assert_no_enqueued_emails do
      post "/api/confirmation/resend", params: { email: "nobody@example.com" }, as: :json
    end
    assert_response :accepted
  end
end
