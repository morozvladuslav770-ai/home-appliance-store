class Product < ApplicationRecord
  ENERGY_CLASSES = %w[A B C D E F G].freeze

  # FR-3.5: в наявності / під замовлення / знято з продажу
  enum :status,
       { in_stock: "in_stock", on_order: "on_order", discontinued: "discontinued" },
       validate: { message: "оберіть статус" }

  has_many :order_items

  # FR-3.3: кілька фото товару; перше завантажене вважається головним
  MAX_PHOTOS = 8
  MAX_PHOTO_SIZE = 5.megabytes
  PHOTO_TYPES = %w[image/jpeg image/png image/webp].freeze
  has_many_attached :photos

  normalizes :energy_class, :image_url, :description, with: ->(value) { value.strip.presence }

  before_validation :generate_sku, on: :create
  before_destroy :ensure_not_ordered

  validates :name, presence: { message: "вкажіть назву" }
  validates :brand, presence: { message: "вкажіть бренд" }
  # Категорії керуються в адмін-панелі, тому список береться з бази
  validates :category, inclusion: { in: ->(_product) { Category.pluck(:name) }, message: "оберіть категорію зі списку" }
  validates :price, numericality: { greater_than: 0, message: "ціна має бути більшою за 0" }
  validates :energy_class, inclusion: { in: ENERGY_CLASSES, message: "оберіть клас від A до G" }, allow_blank: true
  validates :stock_quantity,
            numericality: { only_integer: true, greater_than_or_equal_to: 0, message: "вкажіть ціле число, не менше 0" }
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

  # Повертає залишок (скасування замовлення); якщо товар знову є, він знову «в наявності»
  def release!(quantity)
    return if quantity.zero? || discontinued?

    update_columns(
      stock_quantity: stock_quantity + quantity,
      status: "in_stock",
      updated_at: Time.current
    )
  end

  # Перевіряє файли до збереження, щоб при помилці нічого не змінилося наполовину
  def photo_errors(files, remove_ids = [])
    errors = []
    kept = persisted? ? photos_attachments.reject { |a| remove_ids.include?(a.id) }.size : 0
    errors << "не більше #{MAX_PHOTOS} фото на товар" if kept + files.size > MAX_PHOTOS

    files.each do |file|
      name = file.original_filename
      errors << "«#{name}»: дозволені лише JPG, PNG і WebP" unless PHOTO_TYPES.include?(file.content_type)
      errors << "«#{name}»: файл більший за #{MAX_PHOTO_SIZE / 1.megabyte} МБ" if file.size > MAX_PHOTO_SIZE
    end
    errors
  end

  # Список фото для JSON: [{ id, url }], головне — перше
  def photo_list
    base = Rails.configuration.x.api_url
    photos_attachments.sort_by(&:id).map do |attachment|
      path = Rails.application.routes.url_helpers.rails_blob_path(attachment.blob, only_path: true)
      { id: attachment.id, url: "#{base}#{path}" }
    end
  end

  # image_url — головне фото (або старе посилання, якщо фото не завантажено): так його показують картки й кошик
  def as_json(options = nil)
    list = photo_list
    super.merge("photos" => list, "image_url" => list.first&.fetch(:url) || image_url)
  end

  private

  # Товар, що вже є в замовленнях, видаляти не можна: історія замовлень має зберегтися
  def ensure_not_ordered
    return unless order_items.exists?

    errors.add(:base, "Товар є в замовленнях і не може бути видалений. Позначте його «знято з продажу».")
    throw :abort
  end

  # FR-3.4: унікальний артикул, наприклад TD-AB12CD
  def generate_sku
    return if sku.present?

    loop do
      self.sku = "TD-#{SecureRandom.alphanumeric(6).upcase}"
      break unless Product.exists?(sku: sku)
    end
  end
end
