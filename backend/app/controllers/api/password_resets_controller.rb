class Api::PasswordResetsController < ApplicationController
  rate_limit to: 5, within: 1.minute, store: Rails.cache # NFR-SEC-7

  # POST /api/password_reset { email } — відповідь завжди однакова
  def create
    user = User.find_by(email: params[:email].to_s.strip.downcase)
    UserMailer.password_reset(user).deliver_later if user
    head :accepted
  end

  # PATCH /api/password_reset { token, password, password_confirmation }
  def update
    user = User.find_by_token_for(:password_reset, params[:token].to_s)
    return render_error("Посилання недійсне або застаріле. Запросіть нове.", :unprocessable_entity) unless user

    if params[:password].blank?
      return render json: { errors: { password: [ "вкажіть новий пароль" ] } }, status: :unprocessable_entity
    end

    if user.update(password: params[:password], password_confirmation: params[:password_confirmation])
      user.confirm_email! # лист дійшов на цю адресу
      user.reset_failed_logins!
      head :no_content
    else
      render json: { errors: user.errors.to_hash }, status: :unprocessable_entity
    end
  end
end
