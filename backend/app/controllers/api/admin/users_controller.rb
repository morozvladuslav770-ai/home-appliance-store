# Керування обліковими записами та ролями — лише для адміністратора
class Api::Admin::UsersController < ApplicationController
  before_action :require_admin!

  def index
    render json: User.order(:id).map(&:api_json)
  end

  # PATCH /api/admin/users/:id { role }
  def update
    user = User.find(params[:id])

    if user == current_user
      return render_error("Не можна змінити власну роль", :unprocessable_entity)
    end

    if user.update(role: params.require(:role))
      render json: user.api_json
    else
      render json: { errors: user.errors.to_hash }, status: :unprocessable_entity
    end
  end
end
