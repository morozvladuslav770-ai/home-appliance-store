require "test_helper"

class Api::Admin::CategoriesControllerTest < ActionDispatch::IntegrationTest
  test "покупець не має доступу — 403" do
    get api_admin_categories_url, headers: auth_headers(users(:buyer))
    assert_response :forbidden
  end

  test "список містить кількість товарів" do
    get api_admin_categories_url, headers: auth_headers(users(:manager))
    assert_response :success
    fridges = response.parsed_body.find { |c| c["name"] == "Холодильники" }
    assert_equal 1, fridges["products_count"]
  end

  test "створення категорії пишеться в журнал" do
    assert_difference [ "Category.count", "AuditLog.count" ], 1 do
      post api_admin_categories_url, params: { name: "Мікрохвильові печі" }, headers: auth_headers(users(:manager)), as: :json
    end
    assert_response :created
    assert_equal "category.create", AuditLog.last.action
  end

  test "дублікат назви відхиляється" do
    post api_admin_categories_url, params: { name: "плити" }, headers: auth_headers(users(:manager)), as: :json
    assert_response :unprocessable_entity
    assert response.parsed_body["errors"].key?("name")
  end

  test "перейменування змінює категорію в товарах" do
    category = categories(:fridges)
    patch api_admin_category_url(category), params: { name: "Холодильні шафи" }, headers: auth_headers(users(:manager)), as: :json
    assert_response :success
    assert_equal "Холодильні шафи", products(:fridge).reload.category
    assert_equal "category.update", AuditLog.last.action
  end

  test "категорію з товарами видалити не можна" do
    assert_no_difference "Category.count" do
      delete api_admin_category_url(categories(:fridges)), headers: auth_headers(users(:manager))
    end
    assert_response :unprocessable_entity
  end

  test "порожню категорію можна видалити" do
    assert_difference "Category.count", -1 do
      delete api_admin_category_url(categories(:hoods)), headers: auth_headers(users(:manager))
    end
    assert_response :no_content
  end
end
