require "test_helper"

class Api::ProductsControllerTest < ActionDispatch::IntegrationTest
  test "index повертає всі товари" do
    get api_products_url
    assert_response :success
    assert_equal Product.count, response.parsed_body.size
  end

  test "фільтр за брендом і ціновим діапазоном" do
    get api_products_url, params: { brand: ["Bosch"], min_price: 10_000, max_price: 20_000 }
    names = response.parsed_body.map { |p| p["name"] }
    assert_equal [ "Пральна машина 8 кг" ], names
  end

  test "фільтр за енергокласом" do
    get api_products_url, params: { energy_class: ["A"] }
    assert_equal [ "Холодильник двокамерний" ], response.parsed_body.map { |p| p["name"] }
  end

  test "available=1 ховає зняті з продажу" do
    get api_products_url, params: { available: "1" }
    skus = response.parsed_body.map { |p| p["sku"] }
    assert_not_includes skus, "TD-OVEN01"
  end

  test "сортування за спаданням ціни" do
    get api_products_url, params: { sort: "price_desc" }
    prices = response.parsed_body.map { |p| p["price"].to_f }
    assert_equal prices.sort.reverse, prices
  end

  test "пошук за назвою" do
    get api_products_url, params: { q: "пральна" }
    assert_equal 1, response.parsed_body.size
  end

  test "facets повертає бренди та діапазон цін" do
    get facets_api_products_url
    assert_response :success
    assert_equal %w[Bosch Samsung], response.parsed_body["brands"]
  end

  test "show повертає товар" do
    get api_product_url(products(:fridge))
    assert_response :success
    assert_equal "TD-FRIDGE", response.parsed_body["sku"]
  end
end
