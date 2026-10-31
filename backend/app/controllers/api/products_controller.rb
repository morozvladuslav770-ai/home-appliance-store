class Api::ProductsController < ApplicationController
  # GET /api/products
  # Параметри: q, category, brand[], energy_class[], min_price, max_price,
  #            min_rating, available=1, sort=price_asc|price_desc|rating|popular|newest
  def index
    products = Product
      .search(params[:q])
      .in_category(params[:category])
      .by_brands(Array(params[:brand]).compact_blank)
      .by_energy_classes(Array(params[:energy_class]).compact_blank)
      .min_price(params[:min_price])
      .max_price(params[:max_price])
      .min_rating(params[:min_rating])
    products = products.available if params[:available] == "1"

    render json: products.sorted_by(params[:sort])
  end

  # GET /api/products/facets — значення для бічної панелі фільтрів
  def facets
    render json: {
      brands: Product.where.not(brand: nil).distinct.order(:brand).pluck(:brand),
      energy_classes: Product.where.not(energy_class: nil).distinct.order(:energy_class).pluck(:energy_class),
      min_price: Product.minimum(:price),
      max_price: Product.maximum(:price)
    }
  end

  def show
    render json: Product.find(params[:id])
  end
end
