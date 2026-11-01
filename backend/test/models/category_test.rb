require "test_helper"

class CategoryTest < ActiveSupport::TestCase
  test "нова категорія отримує наступну позицію" do
    category = Category.create!(name: "Мікрохвильові печі")
    assert_equal 7, category.position
  end

  test "назва унікальна без урахування регістру" do
    assert_not Category.new(name: "холодильники").valid?
  end

  test "перейменування оновлює товари категорії" do
    Category.find_by!(name: "Холодильники").update!(name: "Холодильні шафи")
    assert_equal "Холодильні шафи", products(:fridge).reload.category
  end

  test "категорію з товарами видалити не можна" do
    category = Category.find_by!(name: "Холодильники")
    assert_not category.destroy
    assert category.errors[:base].any?
    assert Category.exists?(category.id)
  end

  test "порожню категорію можна видалити" do
    assert Category.find_by!(name: "Витяжки").destroy
  end

  test "товар приймає нову категорію з бази" do
    Category.create!(name: "Мікрохвильові печі")
    product = Product.new(name: "Піч", brand: "LG", category: "Мікрохвильові печі", price: 4000)
    assert product.valid?
  end
end
