class CreateOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :orders do |t|
      t.string :customer_name, null: false
      t.string :email, null: false
      t.string :phone, null: false
      t.string :city, null: false
      t.string :delivery_method, null: false
      t.string :address
      t.string :payment_method, null: false
      t.string :status, null: false, default: "processing"
      t.decimal :total, precision: 12, scale: 2, null: false, default: 0
      t.text :comment

      t.timestamps
    end

    add_index :orders, :status
    add_index :orders, :email

    create_table :order_items do |t|
      t.references :order, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      # Знімок на момент замовлення: назва й ціна не змінюються, якщо товар відредагують
      t.string :name, null: false
      t.string :sku
      t.decimal :unit_price, precision: 12, scale: 2, null: false
      t.integer :quantity, null: false

      t.timestamps
    end
  end
end
