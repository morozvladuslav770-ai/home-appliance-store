# Модерація: відгуки публікуються одразу, а менеджер видаляє ті, що з неприйнятним змістом
class Api::Admin::ReviewsController < Api::Admin::BaseController
  # GET /api/admin/reviews — останні 200
  def index
    reviews = Review.includes(:user, :product).order(created_at: :desc, id: :desc).limit(200)

    render json: reviews.map { |review|
      {
        id: review.id,
        rating: review.rating,
        body: review.body,
        author: review.user.full_name,
        email: review.user.email,
        product: { id: review.product_id, name: review.product.name },
        created_at: review.created_at
      }
    }
  end

  def destroy
    review = Review.includes(:user, :product).find(params[:id])

    Review.transaction do
      AuditLog.record(current_user, "review.destroy", review, summary: review.product.name,
                      details: { author: review.user.email, rating: review.rating, excerpt: review.body.truncate(120) })
      review.destroy!
    end
    head :no_content
  end
end
