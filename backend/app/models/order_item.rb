class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :product

  validates :name, presence: true
  validates :unit_price, numericality: { greater_than: 0 }
  validates :quantity, numericality: { only_integer: true, greater_than: 0 }

  def subtotal
    unit_price * quantity
  end
end
