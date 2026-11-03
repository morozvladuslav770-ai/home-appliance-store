# Список бажаного: клієнт отримує лише id товарів, самі товари вже є в каталозі на фронтенді
class Api::WishlistItemsController < ApplicationController
  before_action :authenticate!

  # GET /api/wishlist
  def index
    render json: { product_ids: product_ids }
  end

  # POST /api/wishlist { product_id } — повторне додавання нічого не ламає
  def create
    product = Product.find_by(id: params.require(:product_id))
    return render_error("Товар не знайдено", :not_found) unless product

    current_user.wishlist_items.find_or_create_by!(product: product)
    render json: { product_ids: product_ids }, status: :created
  end

  # DELETE /api/wishlist/:product_id
  def destroy
    current_user.wishlist_items.where(product_id: params[:product_id]).destroy_all
    render json: { product_ids: product_ids }
  end

  private

  def product_ids
    current_user.wishlist_items.order(created_at: :desc, id: :desc).pluck(:product_id)
  end
end
