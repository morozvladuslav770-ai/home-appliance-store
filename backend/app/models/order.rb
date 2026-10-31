class Order < ApplicationRecord
  MAX_ON_ORDER_QTY = 10

  # FR-4.9: в обробці, оплачено, відправлено, доставлено + NFR-REL-3: очікує оплати
  enum :status, {
    pending_payment: "pending_payment",
    processing: "processing",
    paid: "paid",
    shipped: "shipped",
    delivered: "delivered",
    cancelled: "cancelled"
  }

  # FR-4.8: способи доставки й оплати
  enum :delivery_method, {
    courier: "courier",
    carrier_branch: "carrier_branch",
    pickup: "pickup"
  }, prefix: :delivery, validate: { message: "оберіть спосіб доставки" }

  enum :payment_method, {
    card_online: "card_online",
    cash_on_delivery: "cash_on_delivery",
    installments: "installments"
  }, prefix: :payment, validate: { message: "оберіть спосіб оплати" }

  has_many :order_items, dependent: :destroy

  validates :customer_name, presence: { message: "вкажіть ім'я та прізвище" }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP, message: "вкажіть коректний email" }
  validates :phone, format: { with: /\A\+?[\d\s()\-]{10,18}\z/, message: "вкажіть коректний телефон" }
  validates :city, presence: { message: "вкажіть місто" }
  validates :address, presence: { message: "вкажіть адресу або відділення" }, unless: :delivery_pickup?

  # Створює замовлення з рядків кошика, не довіряючи клієнту ціни й наявність:
  # усе береться з бази, склад перевіряється під блокуванням рядків.
  # Повертає Order; якщо order.persisted? == false — дивіться order.errors.
  def self.place(attributes, raw_items)
    order = new(attributes)

    transaction do
      lines = Array(raw_items).each_with_object(Hash.new(0)) do |item, acc|
        acc[item[:product_id].to_i] += item[:quantity].to_i
      end
      products = Product.where(id: lines.keys).order(:id).lock.index_by(&:id)
      problems = []
      problems << "Кошик порожній" if lines.empty?

      lines.each do |product_id, qty|
        product = products[product_id]
        if product.nil?
          problems << "Товар не знайдено в каталозі"
        elsif product.discontinued?
          problems << "«#{product.name}» знято з продажу"
        elsif qty < 1
          problems << "«#{product.name}»: некоректна кількість"
        elsif product.in_stock? && qty > product.stock_quantity
          problems << "«#{product.name}»: на складі лише #{product.stock_quantity} шт."
        elsif product.on_order? && qty > MAX_ON_ORDER_QTY
          problems << "«#{product.name}»: під замовлення не більше #{MAX_ON_ORDER_QTY} шт."
        else
          order.order_items.build(
            product: product, name: product.name, sku: product.sku,
            unit_price: product.price, quantity: qty
          )
        end
      end

      order.total = order.order_items.sum(&:subtotal)
      # Онлайн-оплата ще не підключена: замовлення чекає оплати, а не губиться
      order.status = order.payment_card_online? ? :pending_payment : :processing

      valid = order.valid?
      problems.each { |message| order.errors.add(:base, message) }

      if valid && problems.empty?
        order.save!
        order.order_items.each { |item| item.product.reserve!(item.quantity) }
      else
        raise ActiveRecord::Rollback
      end
    end

    order
  end
end
