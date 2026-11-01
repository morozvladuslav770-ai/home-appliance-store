class Api::CategoriesController < ApplicationController
  # GET /api/categories — для меню й фільтрів магазину
  def index
    render json: Category.ordered.map { |c| { id: c.id, name: c.name } }
  end
end
