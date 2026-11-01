class Api::Admin::ProductsController < Api::Admin::BaseController
  # GET /api/admin/products?q= — усі товари, зокрема зняті з продажу
  def index
    render json: Product.search(params[:q]).order(id: :desc).limit(500)
  end

  def create
    product = Product.new(product_params)

    if product.save
      AuditLog.record(current_user, "product.create", product,
                      summary: product.name, details: { sku: product.sku, price: product.price })
      render json: product, status: :created
    else
      validation_errors(product)
    end
  end

  def update
    product = Product.find(params[:id])

    if product.update(product_params)
      changes = product.saved_changes.except("updated_at")
      if changes.any?
        AuditLog.record(current_user, "product.update", product,
                        summary: product.name, details: { changes: changes })
      end
      render json: product
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
end
