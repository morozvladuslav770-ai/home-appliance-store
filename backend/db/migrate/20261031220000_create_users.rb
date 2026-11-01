class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :full_name, null: false
      t.string :email, null: false
      t.string :phone
      t.string :password_digest, null: false
      t.string :role, null: false, default: "buyer"
      t.datetime :email_confirmed_at
      t.integer :failed_attempts, null: false, default: 0
      t.datetime :locked_until

      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :role
  end
end
