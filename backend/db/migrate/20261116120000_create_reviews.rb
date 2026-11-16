# FR-4.5: відгуки й оцінки покупців; середня оцінка зберігається в товарі
class CreateReviews < ActiveRecord::Migration[8.1]
  def change
    create_table :reviews do |t|
      t.references :user, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      t.integer :rating, null: false
      t.text :body, null: false
      t.timestamps
    end

    add_index :reviews, [ :user_id, :product_id ], unique: true
    add_column :products, :reviews_count, :integer, null: false, default: 0
  end
end
