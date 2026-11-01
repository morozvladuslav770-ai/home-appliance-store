require "test_helper"

class Api::SessionsControllerTest < ActionDispatch::IntegrationTest
  def login(email, password = PASSWORD, extra = {})
    post api_session_url, params: { email: email, password: password }.merge(extra), as: :json
  end

  test "успішний вхід повертає токен і дані користувача" do
    login(users(:buyer).email)
    assert_response :success
    body = response.parsed_body
    assert body["token"].present?
    assert_equal "buyer", body["user"]["role"]
    assert_not body["user"].key?("password_digest")
  end

  test "токен із входу відкриває GET /api/session" do
    login(users(:buyer).email)
    get api_session_url, headers: { "Authorization" => "Bearer #{response.parsed_body['token']}" }
    assert_response :success
    assert_equal users(:buyer).email, response.parsed_body["user"]["email"]
  end

  test "email нечутливий до регістру" do
    login(users(:buyer).email.upcase)
    assert_response :success
  end

  test "невірний пароль і невідомий email дають однакову відповідь" do
    login(users(:buyer).email, "WrongPass1")
    wrong_password = [ response.status, response.parsed_body ]
    login("nobody@example.com", "WrongPass1")
    assert_equal wrong_password, [ response.status, response.parsed_body ]
    assert_equal 401, response.status
  end

  test "непідтверджений акаунт не може увійти" do
    login(users(:unconfirmed).email)
    assert_response :forbidden
    assert_equal "unconfirmed", response.parsed_body["code"]
  end

  test "після 5 невдалих спроб вхід блокується, навіть із правильним паролем" do
    5.times { login(users(:buyer).email, "WrongPass1") }
    login(users(:buyer).email)
    assert_response :locked
    assert_equal "locked", response.parsed_body["code"]

    travel 16.minutes do
      login(users(:buyer).email)
      assert_response :success
    end
  end

  test "успішний вхід скидає лічильник невдалих спроб" do
    4.times { login(users(:buyer).email, "WrongPass1") }
    login(users(:buyer).email)
    assert_response :success
    assert_equal 0, users(:buyer).reload.failed_attempts
  end

  test "«запам'ятати мене» дає довший токен" do
    login(users(:buyer).email, PASSWORD, remember: true)
    token = response.parsed_body["token"]

    travel 3.days do
      assert User.find_by_token_for(:session, token)
    end
  end

  test "без «запам'ятати мене» токен діє добу" do
    login(users(:buyer).email, PASSWORD, remember: false)
    token = response.parsed_body["token"]

    travel 2.days do
      assert_nil User.find_by_session_token(token)
    end
  end

  test "GET /api/session без токена — 401" do
    get api_session_url
    assert_response :unauthorized
  end
end
