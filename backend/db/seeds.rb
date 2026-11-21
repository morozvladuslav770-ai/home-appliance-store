# Демонстраційний каталог. Скрипт ідемпотентний: повторний запуск не створює дублів.
[
  "Холодильники", "Пральні машини", "Плити", "Посудомийні машини",
  "Витяжки", "Духові шафи", "Морозильні камери"
].each { |name| Category.find_or_create_by!(name: name) }

# Каталог лежить у db/demo_products.yml (довгі описи зручніше редагувати там)
DEMO_PRODUCTS = YAML.load_file(Rails.root.join("db/demo_products.yml")).freeze

DEMO_PRODUCTS.each_with_index do |attrs, i|
  product = Product.find_or_initialize_by(name: attrs["name"])

  if product.new_record?
    product.assign_attributes(
      category: attrs["category"], brand: attrs["brand"], energy_class: attrs["energy_class"],
      price: attrs["price"], rating: attrs["rating"], stock_quantity: attrs["stock"],
      status: attrs["stock"].zero? ? :on_order : :in_stock,
      description: attrs["description"], created_at: (DEMO_PRODUCTS.size - i).days.ago
    )
    product.save!
  elsif product.description.to_s.length < 300
    # старий короткий опис оновлюємо; описи, які вже розширили в адмінці, не чіпаємо
    product.update!(description: attrs["description"])
  end
end

puts "Товарів у каталозі: #{Product.count}"

# Демонстраційні акаунти (пароль для всіх: Password1). У production не створюються.
unless Rails.env.production?
  [
    [ "admin@technodim.test", "Адміністратор системи", "admin" ],
    [ "manager@technodim.test", "Менеджер магазину", "manager" ],
    [ "buyer@technodim.test", "Іван Покупець", "buyer" ]
  ].each do |email, full_name, role|
    User.find_or_create_by!(email: email) do |user|
      user.full_name = full_name
      user.phone = "+380501234567"
      user.password = user.password_confirmation = "Password1"
      user.role = role
      user.email_confirmed_at = Time.current
    end
  end

  puts "Демо-акаунти: admin@ / manager@ / buyer@technodim.test, пароль Password1"
end
