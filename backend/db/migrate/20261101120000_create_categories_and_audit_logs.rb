class CreateCategoriesAndAuditLogs < ActiveRecord::Migration[8.1]
  DEFAULT_CATEGORIES = [
    "Холодильники", "Пральні машини", "Плити", "Посудомийні машини",
    "Витяжки", "Духові шафи", "Морозильні камери"
  ].freeze

  def up
    create_table :categories do |t|
      t.string :name, null: false
      t.integer :position, null: false, default: 0
      t.timestamps
    end
    add_index :categories, :name, unique: true

    # Перенесення наявних категорій, щоб існуючі товари лишилися валідними
    now = connection.quote(Time.current)
    names = (DEFAULT_CATEGORIES + select_values("SELECT DISTINCT category FROM products")).uniq
    names.each_with_index do |name, index|
      execute <<~SQL
        INSERT INTO categories (name, position, created_at, updated_at)
        VALUES (#{connection.quote(name)}, #{index}, #{now}, #{now})
      SQL
    end

    # Журнал аудиту критичних дій у адмін-панелі (NFR-SEC-8)
    create_table :audit_logs do |t|
      t.references :user, null: true, foreign_key: { on_delete: :nullify }
      t.string :action, null: false
      t.string :subject_type
      t.bigint :subject_id
      t.string :summary
      t.jsonb :details, null: false, default: {}
      t.datetime :created_at, null: false
    end
    add_index :audit_logs, :created_at
  end

  def down
    drop_table :audit_logs
    drop_table :categories
  end
end
