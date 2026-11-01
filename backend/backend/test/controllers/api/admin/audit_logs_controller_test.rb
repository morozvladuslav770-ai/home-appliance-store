require "test_helper"

class Api::Admin::AuditLogsControllerTest < ActionDispatch::IntegrationTest
  test "менеджер журнал не бачить — 403" do
    get api_admin_audit_logs_url, headers: auth_headers(users(:manager))
    assert_response :forbidden
  end

  test "без входу — 401" do
    get api_admin_audit_logs_url
    assert_response :unauthorized
  end

  test "адміністратор бачить записи з іменем автора, нові першими" do
    AuditLog.record(users(:manager), "product.update", products(:fridge), summary: "Холодильник", details: { changes: { "price" => [ "1", "2" ] } })
    AuditLog.record(users(:admin), "user.role", users(:buyer), summary: "buyer@example.com")

    get api_admin_audit_logs_url, headers: auth_headers(users(:admin))
    assert_response :success
    assert_equal "user.role", response.parsed_body.first["action"]
    assert_equal "Андрій Адмін", response.parsed_body.first["actor"]
    assert_equal 2, response.parsed_body.size
  end
end
