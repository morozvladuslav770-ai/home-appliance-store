class Api::Admin::CategoriesController < Api::Admin::BaseController
  def index
    counts = Product.group(:category).count
    render json: Category.ordered.map { |c| serialize(c, counts[c.name] || 0) }
  end

  def create
    category = Category.new(name: params.require(:name))

    if category.save
      AuditLog.record(current_user, "category.create", category, summary: category.name)
      render json: serialize(category, 0), status: :created
    else
      validation_errors(category)
    end
  end

  # PATCH /api/admin/categories/:id { name } — товари перейменованої категорії оновлюються
  def update
    category = Category.find(params[:id])
    old_name = category.name

    if category.update(name: params.require(:name))
      if category.saved_change_to_name?
        AuditLog.record(current_user, "category.update", category,
                        summary: category.name, details: { name: [ old_name, category.name ] })
      end
      render json: serialize(category, Product.where(category: category.name).count)
    else
      validation_errors(category)
    end
  end

  def destroy
    category = Category.find(params[:id])

    if category.destroy
      AuditLog.record(current_user, "category.destroy", category, summary: category.name)
      head :no_content
    else
      validation_errors(category)
    end
  end

  private

  def serialize(category, count)
    { id: category.id, name: category.name, position: category.position, products_count: count }
  end
end
