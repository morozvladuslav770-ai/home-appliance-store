class Api::ConfirmationsController < ApplicationController
  rate_limit to: 10, within: 1.minute, store: Rails.cache

  # POST /api/confirmation { token }
  def create
    user = User.find_by_token_for(:email_confirmation, params[:token].to_s)

    if user
      user.confirm_email!
      render json: { user: user.api_json }
    else
      render_error("Посилання недійсне або застаріле. Запросіть новий лист.", :unprocessable_entity)
    end
  end

  # POST /api/confirmation/resend { email } — відповідь завжди однакова,
  # щоб не розкривати, які адреси зареєстровані
  def resend
    user = User.find_by(email: params[:email].to_s.strip.downcase)
    UserMailer.confirmation(user).deliver_later if user && !user.email_confirmed?
    head :accepted
  end
end
