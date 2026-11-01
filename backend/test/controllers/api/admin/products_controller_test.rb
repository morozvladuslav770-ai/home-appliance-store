require "test_helper"

class Api::Admin::ProductsControllerTest < ActionDispatch::IntegrationTest
  def attrs(overrides = {})
    { name: "Плита індукційна", brand: "Gorenje", category: "Плити", price: 19_999,
      energy_class: "A", status: "in_stock", stock_quantity: 4, description: "Тест" }.merge(overrides)
  end

  test "без входу — 401" do
    get api_admin_products_url
    assert_response :unauthorized
  end

  test "покупець не має доступу — 403" do
    get api_admin_products_url, headers: auth_headers(users(:buyer))
    assert_response :forbidden
  end

  test "менеджер бачить усі товари, зокрема зняті з продажу" do
    get api_admin_products_url, headers: auth_headers(users(:manager))
    assert_response :success
    assert_equal Product.count, response.parsed_body.size
  end

  test "менеджер створює товар з автоматичним артикулом і записом у журналі" do
    assert_difference [ "Product.count", "AuditLog.count" ], 1 do
      post api_admin_products_url, params: { product: attrs }, headers: auth_headers(users(:manager)), as: :json
    end
    assert_response :created
    assert_match(/\ATD-/, response.parsed_body["sku"])
    assert_equal "product.create", AuditLog.last.action
    assert_equal users(:manager), AuditLog.last.user
  end

  test "артикул і рейтинг із форми ігноруються" do
    post api_admin_products_url,
         params: { product: attrs(sku: "HACKED", rating: 5) }, headers: auth_headers(users(:manager)), as: :json
    assert_response :created
    assert_not_equal "HACKED", response.parsed_body["sku"]
    assert_nil response.parsed_body["rating"]
  end

  test "помилки валідації повертаються по полях" do
    post api_admin_products_url,
         params: { product: attrs(name: "", price: 0, category: "Іграшки") },
         headers: auth_headers(users(:manager)), as: :json
    assert_response :unprocessable_entity
    errors = response.parsed_body["errors"]
    assert errors.key?("name")
    assert errors.key?("price")
    assert errors.key?("category")
  end

  test "зміна ціни потрапляє в журнал із старим і новим значенням" do
    fridge = products(:fridge)
    patch api_admin_product_url(fridge),
          params: { product: { price: 31_000 } }, headers: auth_headers(users(:manager)), as: :json
    assert_response :success

    log = AuditLog.last
    assert_equal "product.update", log.action
    old_price, new_price = log.details.dig("changes", "price")
    assert_equal fridge.price.to_s("F").to_f, old_price.to_f
    assert_equal 31_000.0, new_price.to_f
  end

  test "оновлення без змін не створює запис у журналі" do
    assert_no_difference "AuditLog.count" do
      patch api_admin_product_url(products(:fridge)),
            params: { product: { name: products(:fridge).name } }, headers: auth_headers(users(:manager)), as: :json
    end
  end

  test "неіснуючий статус — 422, а не 500" do
    patch api_admin_product_url(products(:fridge)),
          params: { product: { status: "bogus" } }, headers: auth_headers(users(:manager)), as: :json
    assert_response :unprocessable_entity
    assert response.parsed_body["errors"].key?("status")
  end

  test "видалення товару пишеться в журнал" do
    assert_difference "Product.count", -1 do
      delete api_admin_product_url(products(:old_oven)), headers: auth_headers(users(:manager))
    end
    assert_response :no_content
    assert_equal "product.destroy", AuditLog.last.action
  end

  test "товар із замовленнями видалити не можна" do
    Order.place(
      { customer_name: "Іван", email: "ivan@example.com", phone: "+380501234567", city: "Київ",
        delivery_method: "courier", address: "вул. Тестова, 1", payment_method: "cash_on_delivery" },
      [ { product_id: products(:fridge).id, quantity: 1 } ]
    )
    assert_no_difference "Product.count" do
      delete api_admin_product_url(products(:fridge)), headers: auth_headers(users(:admin))
    end
    assert_response :unprocessable_entity
  end
end
