class Review < ApplicationRecord
  belongs_to :user
  belongs_to :product

  normalizes :body, with: ->(value) { value.strip }

  validates :rating, inclusion: { in: 1..5, message: "оберіть оцінку від 1 до 5" }
  validates :body, presence: { message: "напишіть текст відгуку" },
                   length: { minimum: 10, maximum: 2000,
                             too_short: "занадто короткий (мінімум %{count} символів)",
                             too_long: "занадто довгий (максимум %{count} символів)" }
  validates :product_id, uniqueness: { scope: :user_id, message: "ви вже залишили відгук на цей товар" }
  validate :must_have_purchased, on: :create

  after_save :refresh_product
  after_destroy :refresh_product

  # FR-4.5: відгук може залишити лише той, хто отримав цей товар (замовлення «Доставлено»)
  def self.purchased?(user, product)
    OrderItem.joins(:order).exists?(product_id: product.id, orders: { user_id: user.id, status: "delivered" })
  end

  # «Іван Петренко» → «Іван П.»: прізвище повністю не показуємо
  def author_name
    first, last = user.full_name.split
    last ? "#{first} #{last[0]}." : first.to_s
  end

  private

  def must_have_purchased
    return unless user && product
    return if self.class.purchased?(user, product)

    errors.add(:base, "Відгук можуть залишити лише покупці, які вже отримали цей товар")
  end

  def refresh_product
    product.refresh_rating!
  end
end
