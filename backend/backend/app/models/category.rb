class Category < ApplicationRecord
  # Товари пов'язані з категорією за назвою (products.category)
  has_many :products, primary_key: :name, foreign_key: :category, inverse_of: false

  normalizes :name, with: ->(value) { value.strip.squish }

  validates :name,
            presence: { message: "вкажіть назву категорії" },
            uniqueness: { case_sensitive: false, message: "така категорія вже існує" }

  before_create { self.position = (Category.maximum(:position) || -1) + 1 }
  after_update :rename_products, if: :saved_change_to_name?
  before_destroy :ensure_empty

  scope :ordered, -> { order(:position, :id) }

  private

  def rename_products
    Product.where(category: name_before_last_save).update_all(category: name, updated_at: Time.current)
  end

  def ensure_empty
    return unless products.exists?

    errors.add(:base, "У категорії є товари. Перенесіть або видаліть їх, потім видаляйте категорію.")
    throw :abort
  end
end
