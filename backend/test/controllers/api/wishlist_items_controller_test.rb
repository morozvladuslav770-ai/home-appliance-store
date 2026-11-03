require "test_helper"

class Api::WishlistItemsControllerTest < ActionDispatch::IntegrationTest
  test "без входу — 401" do
    get api_wishlist_url
    assert_response :unauthorized
    post api_wishlist_url, params: { product_id: products(:fridge).id }, as: :json
    assert_response :unauthorized
  end

  test "додає товар у список бажаного, повторне додавання не дублює" do
    assert_difference "WishlistItem.count", 1 do
      2.times do
        post api_wishlist_url, params: { product_id: products(:fridge).id },
             headers: auth_headers(users(:buyer)), as: :json
      end
    end
    assert_response :created
    assert_equal [ products(:fridge).id ], response.parsed_body["product_ids"]
  end

  test "список бажаного у кожного користувача свій" do
    post api_wishlist_url, params: { product_id: products(:fridge).id },
         headers: auth_headers(users(:buyer)), as: :json

    get api_wishlist_url, headers: auth_headers(users(:manager))
    assert_equal [], response.parsed_body["product_ids"]

    get api_wishlist_url, headers: auth_headers(users(:buyer))
    assert_equal [ products(:fridge).id ], response.parsed_body["product_ids"]
  end

  test "новіші товари йдуть першими" do
    [ products(:fridge), products(:washer) ].each do |product|
      post api_wishlist_url, params: { product_id: product.id }, headers: auth_headers(users(:buyer)), as: :json
    end
    get api_wishlist_url, headers: auth_headers(users(:buyer))
    assert_equal [ products(:washer).id, products(:fridge).id ], response.parsed_body["product_ids"]
  end

  test "видаляє товар зі списку, чужі записи не чіпає" do
    WishlistItem.create!(user: users(:buyer), product: products(:fridge))
    WishlistItem.create!(user: users(:manager), product: products(:fridge))

    assert_difference "WishlistItem.count", -1 do
      delete api_wishlist_item_url(product_id: products(:fridge).id), headers: auth_headers(users(:buyer))
    end
    assert_response :success
    assert_equal [], response.parsed_body["product_ids"]
    assert_equal 1, users(:manager).wishlist_items.count
  end

  test "неіснуючий товар — 404" do
    post api_wishlist_url, params: { product_id: 0 }, headers: auth_headers(users(:buyer)), as: :json
    assert_response :not_found
  end

  test "видалення товару з каталогу прибирає його зі списків бажаного" do
    product = Product.create!(name: "Тест", brand: "X", category: "Плити", price: 100)
    WishlistItem.create!(user: users(:buyer), product: product)
    assert_difference "WishlistItem.count", -1 do
      product.destroy
    end
  end
end
