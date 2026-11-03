class Api::Admin::ProductsController < Api::Admin::BaseController
  # GET /api/admin/products?q= — усі товари, зокрема зняті з продажу
  def index
    render json: Product.with_attached_photos.search(params[:q]).order(id: :desc).limit(500)
  end

  # Дані приходять як multipart: product[...], photos[] (нові файли), remove_photo_ids[] (які фото прибрати)
  def create
    product = Product.new(product_params)

    if save_with_photos(product)
      AuditLog.record(current_user, "product.create", product,
                      summary: product.name, details: { sku: product.sku, price: product.price })
      render json: product.reload, status: :created
    else
      validation_errors(product)
    end
  end

  def update
    product = Product.with_attached_photos.find(params[:id])
    product.assign_attributes(product_params)

    if (changes = save_with_photos(product))
      AuditLog.record(current_user, "product.update", product,
                      summary: product.name, details: { changes: changes }) if changes.any?
      render json: product.reload
    else
      validation_errors(product)
    end
  end

  def destroy
    product = Product.find(params[:id])

    if product.destroy
      AuditLog.record(current_user, "product.destroy", product,
                      summary: product.name, details: { sku: product.sku, price: product.price })
      head :no_content
    else
      validation_errors(product)
    end
  end

  private

  # Рейтинг і артикул з форми не приймаються: артикул генерується, рейтинг рахуватиметься з відгуків
  def product_params
    params.require(:product).permit(
      :name, :brand, :category, :price, :description,
      :energy_class, :status, :stock_quantity, :image_url
    )
  end

  def new_photos
    Array(params[:photos]).select { |file| file.respond_to?(:original_filename) }
  end

  def removed_photo_ids
    Array(params[:remove_photo_ids]).map(&:to_i)
  end

  # Спочатку перевіряє і поля, і файли, і лише потім щось змінює.
  # Повертає зміни полів для журналу (або false, якщо є помилки).
  def save_with_photos(product)
    files = new_photos
    removed = product.persisted? ? removed_photo_ids & product.photos_attachments.map(&:id) : []

    product.valid?
    product.photo_errors(files, removed).each { |message| product.errors.add(:photos, message) }
    return false if product.errors.any?

    changes = {}
    Product.transaction do
      product.save!
      changes = product.saved_changes.except("updated_at") # до attach, який зберігає запис ще раз
      product.photos_attachments.where(id: removed).find_each(&:purge)
      product.photos.attach(files) if files.any?
    end

    parts = []
    parts << "додано #{files.size}" if files.any?
    parts << "видалено #{removed.size}" if removed.any?
    changes["photos"] = [ nil, parts.join(", ") ] if parts.any?
    changes
  end
end
