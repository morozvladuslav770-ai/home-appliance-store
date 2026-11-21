namespace :products do
  desc "Додає фото з db/seed_photos/NN/ до демо-товарів (FORCE=1 — замінити наявні фото)"
  task import_photos: :environment do
    demo = YAML.load_file(Rails.root.join("db/demo_products.yml"))
    root = Rails.root.join("db/seed_photos")
    types = { ".jpg" => "image/jpeg", ".jpeg" => "image/jpeg", ".png" => "image/png", ".webp" => "image/webp" }
    force = ENV["FORCE"] == "1"
    imported = 0

    demo.each_with_index do |attrs, index|
      number = format("%02d", index + 1)
      files = Dir[root.join(number, "*")].sort.select { |path| types.key?(File.extname(path).downcase) }
      next if files.empty?

      product = Product.find_by(name: attrs["name"])
      unless product
        puts "#{number}: товару «#{attrs['name']}» немає в базі, спершу виконайте bin/rails db:seed"
        next
      end

      if product.photos.attached?
        unless force
          puts "#{number}: у «#{product.name}» вже є фото (FORCE=1 замінить їх)"
          next
        end
        product.photos.purge
      end

      attached = 0
      files.each do |path|
        if File.size(path) > Product::MAX_PHOTO_SIZE
          puts "#{number}: #{File.basename(path)} більший за #{Product::MAX_PHOTO_SIZE / 1.megabyte} МБ, пропущено"
        elsif attached >= Product::MAX_PHOTOS
          puts "#{number}: ліміт #{Product::MAX_PHOTOS} фото, #{File.basename(path)} пропущено"
        else
          File.open(path, "rb") do |io|
            product.photos.attach(io: io, filename: File.basename(path), content_type: types[File.extname(path).downcase])
          end
          attached += 1
        end
      end

      puts "#{number}: «#{product.name}»: додано фото: #{attached}"
      imported += 1 if attached.positive?
    end

    puts "Готово. Оновлено товарів: #{imported}"
  end
end
