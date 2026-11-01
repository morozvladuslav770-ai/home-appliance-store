class LinkOrdersToUsers < ActiveRecord::Migration[8.1]
  def change
    # Замовлення лишаються в обліку, навіть якщо акаунт видалено (user_id стає NULL)
    add_reference :orders, :user, null: true, foreign_key: true
    # Скільки одиниць реально списано зі складу (0 для товарів «під замовлення»);
    # потрібно, щоб при скасуванні повернути на склад правильну кількість
    add_column :order_items, :reserved_quantity, :integer, null: false, default: 0
  end
end
