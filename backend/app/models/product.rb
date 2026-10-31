class Product < ApplicationRecord
  CATEGORIES = [
    "Холодильники",
    "Пральні машини",
    "Плити",
    "Посудомийні машини",
    "Витяжки",
    "Духові шафи",
    "Морозильні камери"
  ].freeze

  ENERGY_CLASSES = %w[A B C D E F G].freeze

  # FR-3.5: в наявності / під замовлення / знято з продажу
  enum :status, { in_stock: "in_stock", on_order: "on_order", discontinued: "discontinued" }

  before_validation :generate_sku, on: :create

  validates :name, :brand, presence: true
  validates :category, inclusion: { in: CATEGORIES }
  validates :price, numericality: { greater_than: 0 }
  validates :energy_class, inclusion: { in: ENERGY_CLASSES }, allow_blank: true
  validates :stock_quantity, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :rating, numericality: { in: 0..5 }, allow_nil: true
  validates :sku, uniqueness: true

  scope :in_category, ->(value) { where(category: value) if value.present? }
  scope :by_brands, ->(values) { where(brand: values) if values.present? }
  scope :min_price, ->(value) { where("price >= ?", value) if value.present? }
  scope :max_price, ->(value) { where("price <= ?", value) if value.present? }
  scope :by_energy_classes, ->(values) { where(energy_class: values) if values.present? }
  scope :min_rating, ->(value) { where("rating >= ?", value) if value.present? }
  scope :available, -> { where(status: [ :in_stock, :on_order ]) }
  scope :search, lambda { |term|
    if term.present?
      pattern = "%#{sanitize_sql_like(term.strip)}%"
      where("name ILIKE :p OR brand ILIKE :p OR category ILIKE :p", p: pattern)
    end
  }

  # FR-4.2: сортування за ціною, популярністю (рейтинг), рейтингом і датою
  SORTS = {
    "price_asc" => { price: :asc },
    "price_desc" => { price: :desc },
    "rating" => { rating: :desc, id: :desc },
    "popular" => { rating: :desc, stock_quantity: :asc, id: :desc },
    "newest" => { created_at: :desc, id: :desc }
  }.freeze

  def self.sorted_by(key)
    order(SORTS.fetch(key.to_s, SORTS["newest"]))
  end

  # Зменшує залишок; коли товар закінчився, він переходить у «під замовлення»
  def reserve!(quantity)
    return unless in_stock?

    left = [ stock_quantity - quantity, 0 ].max
    update_columns(
      stock_quantity: left,
      status: left.zero? ? "on_order" : status,
      updated_at: Time.current
    )
  end

  private

  # FR-3.4: унікальний артикул, наприклад TD-AB12CD
  def generate_sku
    return if sku.present?

    loop do
      self.sku = "TD-#{SecureRandom.alphanumeric(6).upcase}"
      break unless Product.exists?(sku: sku)
    end
  end
end
