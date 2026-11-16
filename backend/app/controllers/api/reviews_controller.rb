class Api::ReviewsController < ApplicationController
  before_action :authenticate!, only: [ :create, :update ]

  # GET /api/products/:product_id/reviews — відгуки видно всім.
  # eligibility підказує інтерфейсу, що показати: guest | not_purchased | can_review | reviewed
  def index
    product = Product.find(params[:product_id])
    reviews = product.reviews.includes(:user).order(created_at: :desc, id: :desc)

    render json: { reviews: reviews.map { |review| serialize(review) }, eligibility: eligibility(product, reviews) }
  end

  # POST /api/products/:product_id/reviews { review: { rating, body } }
  def create
    review = current_user.reviews.build(review_params.merge(product: Product.find(params[:product_id])))

    if review.save
      render json: serialize(review), status: :created
    else
      render json: { errors: review.errors.to_hash }, status: :unprocessable_entity
    end
  end

  # PATCH /api/reviews/:id — автор може виправити свій відгук
  def update
    review = current_user.reviews.find(params[:id])

    if review.update(review_params)
      render json: serialize(review)
    else
      render json: { errors: review.errors.to_hash }, status: :unprocessable_entity
    end
  end

  private

  def review_params
    params.require(:review).permit(:rating, :body)
  end

  def serialize(review)
    {
      id: review.id,
      rating: review.rating,
      body: review.body,
      author: review.author_name,
      created_at: review.created_at,
      mine: review.user_id == current_user&.id
    }
  end

  def eligibility(product, reviews)
    return "guest" unless current_user
    return "reviewed" if reviews.any? { |review| review.user_id == current_user.id }

    Review.purchased?(current_user, product) ? "can_review" : "not_purchased"
  end
end
