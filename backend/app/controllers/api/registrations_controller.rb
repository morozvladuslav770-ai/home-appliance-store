class Api::RegistrationsController < ApplicationController
  rate_limit to: 10, within: 1.minute, store: Rails.cache, only: :create # NFR-SEC-7

  # POST /api/registration { user: { full_name, email, phone, password, password_confirmation } }
  # Роль завжди «покупець»: з параметрів вона не читається.
  def create
    user = User.new(user_params.merge(role: "buyer"))

    if user.save
      UserMailer.confirmation(user).deliver_later # FR-1.4: через фонову чергу
      render json: { email: user.email }, status: :created
    else
      render json: { errors: user.errors.to_hash }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:full_name, :email, :phone, :password, :password_confirmation)
  end
end
