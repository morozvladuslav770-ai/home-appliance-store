require "test_helper"

class Api::Admin::ProductPhotosTest < ActionDispatch::IntegrationTest
  def attrs(overrides = {})
    { name: "Плита індукційна", brand: "Gorenje", category: "Плити", price: 19_999,
      energy_class: "A", status: "in_stock", stock_quantity: 4 }.merge(overrides)
  end

  def png
    fixture_file_upload("photo.png", "image/png")
  end

  def manager = auth_headers(users(:manager))

  test "створення товару з кількома фото" do
    post api_admin_products_url, params: { product: attrs, photos: [ png, png ] }, headers: manager

    assert_response :created
    body = response.parsed_body
    assert_equal 2, body["photos"].size
    assert_equal body["photos"].first["url"], body["image_url"], "головне фото — перше"
    assert_equal 2, Product.find(body["id"]).photos.count
  end

  test "текстовий файл замість зображення відхиляється, товар не створюється" do
    assert_no_difference "Product.count" do
      post api_admin_products_url,
           params: { product: attrs, photos: [ fixture_file_upload("notes.txt", "text/plain") ] },
           headers: manager
    end
    assert_response :unprocessable_entity
    assert_match(/JPG, PNG/, response.parsed_body.dig("errors", "photos").first)
  end

  test "занадто великий файл відхиляється" do
    big = Tempfile.new([ "big", ".png" ])
    big.binmode
    big.write("0" * (Product::MAX_PHOTO_SIZE + 1))
    big.flush

    assert_no_difference "Product.count" do
      post api_admin_products_url,
           params: { product: attrs, photos: [ Rack::Test::UploadedFile.new(big.path, "image/png") ] },
           headers: manager
    end
    assert_response :unprocessable_entity
    assert_match(/більший за 5 МБ/, response.parsed_body.dig("errors", "photos").first)
  ensure
    big&.close!
  end

  test "понад 8 фото відхиляється" do
    post api_admin_products_url,
         params: { product: attrs, photos: Array.new(Product::MAX_PHOTOS + 1) { png } }, headers: manager
    assert_response :unprocessable_entity
    assert_match(/не більше 8/, response.parsed_body.dig("errors", "photos").first)
  end

  test "помилка в полях не залишає завантажених фото" do
    assert_no_difference [ "Product.count", "ActiveStorage::Attachment.count" ] do
      post api_admin_products_url, params: { product: attrs(name: ""), photos: [ png ] }, headers: manager
    end
    assert_response :unprocessable_entity
    assert response.parsed_body["errors"].key?("name")
  end

  test "оновлення додає нові й видаляє позначені фото та пишеться в журнал" do
    product = products(:fridge)
    product.photos.attach(io: File.open(file_fixture("photo.png")), filename: "a.png", content_type: "image/png")
    old_id = product.photos_attachments.first.id

    patch api_admin_product_url(product),
          params: { product: { name: product.name }, photos: [ png, png ], remove_photo_ids: [ old_id ] },
          headers: manager

    assert_response :success
    assert_equal 2, response.parsed_body["photos"].size
    assert_not_includes response.parsed_body["photos"].map { |p| p["id"] }, old_id
    assert_equal "product.update", AuditLog.last.action
    assert_equal "додано 2, видалено 1", AuditLog.last.details.dig("changes", "photos").last
  end

  test "не можна видалити чужі фото через remove_photo_ids" do
    mine = products(:fridge)
    other = products(:washer)
    other.photos.attach(io: File.open(file_fixture("photo.png")), filename: "b.png", content_type: "image/png")
    foreign_id = other.photos_attachments.first.id

    patch api_admin_product_url(mine), params: { product: { name: mine.name }, remove_photo_ids: [ foreign_id ] },
          headers: manager

    assert_response :success
    assert_equal 1, other.reload.photos.count
  end

  test "публічний каталог віддає фото, а image_url — головне фото" do
    product = products(:fridge)
    product.photos.attach(io: File.open(file_fixture("photo.png")), filename: "a.png", content_type: "image/png")

    get api_product_url(product)
    assert_response :success
    assert_equal 1, response.parsed_body["photos"].size
    assert_equal response.parsed_body["photos"].first["url"], response.parsed_body["image_url"]
    assert_match %r{\Ahttp://localhost:3000/rails/active_storage/blobs/}, response.parsed_body["image_url"]
  end

  test "без фото лишається старе посилання image_url" do
    product = products(:fridge)
    product.update_columns(image_url: "https://example.com/old.jpg")

    get api_product_url(product)
    assert_equal [], response.parsed_body["photos"]
    assert_equal "https://example.com/old.jpg", response.parsed_body["image_url"]
  end
end
