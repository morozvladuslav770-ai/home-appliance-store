class Api::SessionsController < ApplicationController
  rate_limit to: 10, within: 1.minute, store: Rails.cache, only: :create # NFR-SEC-7
  before_action :authenticate!, only: :show

  # GET /api/session — поточний користувач за токеном
  def show
    render json: { user: current_user.api_json }
  end

  # POST /api/session { email, password, remember }
  def create
    user = User.find_by(email: params[:email].to_s.strip.downcase)

    if user&.locked? # FR-2.3
      return render_error(
        "Забагато невдалих спроб входу. Спробуйте за 15 хвилин або відновіть пароль.",
        :locked, code: "locked"
      )
    end

    unless user&.authenticate(params[:password].to_s)
      user&.register_failed_login!
      return render_error("Невірний email або пароль", :unauthorized, code: "invalid_credentials")
    end

    unless user.email_confirmed? # FR-1.5
      return render_error(
        "Підтвердьте email: ми надсилали вам лист із посиланням.",
        :forbidden, code: "unconfirmed"
      )
    end

    user.reset_failed_logins!
    # FR-2.5 «Запам'ятати мене»: довша дія токена
    kind = ActiveModel::Type::Boolean.new.cast(params[:remember]) ? :session : :short_session
    render json: { token: user.generate_token_for(kind), user: user.api_json }
  end
end
