class AddDetailsToProducts < ActiveRecord::Migration[8.1]
  def change
    add_column :products, :brand, :string
    add_column :products, :energy_class, :string
    add_column :products, :status, :string, null: false, default: "in_stock"
    add_column :products, :sku, :string
    add_column :products, :stock_quantity, :integer, null: false, default: 0
    add_column :products, :rating, :decimal, precision: 2, scale: 1
    add_column :products, :image_url, :string

    add_index :products, :sku, unique: true
    add_index :products, :brand
    add_index :products, :category
    add_index :products, :status
  end
end
