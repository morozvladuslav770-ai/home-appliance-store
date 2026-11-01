require "test_helper"

class Api::Admin::UsersControllerTest < ActionDispatch::IntegrationTest
  test "без входу — 401" do
    get api_admin_users_url
    assert_response :unauthorized
  end

  test "покупець не має доступу — 403" do
    get api_admin_users_url, headers: auth_headers(users(:buyer))
    assert_response :forbidden
  end

  test "менеджер не керує користувачами — 403" do
    get api_admin_users_url, headers: auth_headers(users(:manager))
    assert_response :forbidden
  end

  test "адміністратор бачить усіх користувачів без хешів паролів" do
    get api_admin_users_url, headers: auth_headers(users(:admin))
    assert_response :success
    assert_equal User.count, response.parsed_body.size
    assert response.parsed_body.none? { |u| u.key?("password_digest") }
  end

  test "адміністратор змінює роль" do
    patch api_admin_user_url(users(:buyer)), params: { role: "manager" }, headers: auth_headers(users(:admin)), as: :json
    assert_response :success
    assert users(:buyer).reload.manager?
  end

  test "невідома роль відхиляється" do
    patch api_admin_user_url(users(:buyer)), params: { role: "root" }, headers: auth_headers(users(:admin)), as: :json
    assert_response :unprocessable_entity
    assert users(:buyer).reload.buyer?
  end

  test "адміністратор не може змінити власну роль" do
    patch api_admin_user_url(users(:admin)), params: { role: "buyer" }, headers: auth_headers(users(:admin)), as: :json
    assert_response :unprocessable_entity
    assert users(:admin).reload.admin?
  end

  test "покупець не може підвищити собі роль" do
    patch api_admin_user_url(users(:buyer)), params: { role: "admin" }, headers: auth_headers(users(:buyer)), as: :json
    assert_response :forbidden
    assert users(:buyer).reload.buyer?
  end
end
