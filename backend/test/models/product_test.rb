require "test_helper"

class ProductTest < ActiveSupport::TestCase
  def build_product(attrs = {})
    Product.new({ name: "Плита", brand: "Gorenje", category: "Плити", price: 14_299 }.merge(attrs))
  end

  test "генерує унікальний артикул при створенні" do
    product = build_product
    assert product.save
    assert_match(/\ATD-[A-Z0-9]{6}\z/, product.sku)
  end

  test "не змінює артикул, заданий вручну" do
    product = build_product(sku: "TD-CUSTOM")
    product.save!
    assert_equal "TD-CUSTOM", product.sku
  end

  test "відхиляє невідому категорію та від'ємну ціну" do
    assert_not build_product(category: "Іграшки").valid?
    assert_not build_product(price: -1).valid?
  end

  test "відхиляє некоректний енергоклас і рейтинг" do
    assert_not build_product(energy_class: "Z").valid?
    assert_not build_product(rating: 6).valid?
  end

  test "статус за замовчуванням — в наявності" do
    assert build_product.in_stock?
  end

  test "фільтр available виключає зняті з продажу" do
    assert_not_includes Product.available, products(:old_oven)
    assert_includes Product.available, products(:washer)
  end

  test "сортування за ціною" do
    prices = Product.sorted_by("price_asc").pluck(:price)
    assert_equal prices.sort, prices
  end
end
