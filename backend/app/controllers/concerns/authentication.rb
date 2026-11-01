# Автентифікація за токеном: заголовок «Authorization: Bearer <token>».
# Ролі: buyer < manager < admin (адміністратор має всі права менеджера).
module Authentication
  extend ActiveSupport::Concern

  private

  def current_user
    return @current_user if defined?(@current_user)

    token = request.authorization.to_s[/\ABearer (.+)\z/, 1]
    @current_user = User.find_by_session_token(token)
  end

  def authenticate!
    render_error("Увійдіть в акаунт, щоб продовжити", :unauthorized) unless current_user
  end

  def require_staff!
    authenticate!
    return if performed?

    render_error("Недостатньо прав", :forbidden) unless current_user.staff?
  end

  def require_admin!
    authenticate!
    return if performed?

    render_error("Недостатньо прав", :forbidden) unless current_user.admin?
  end

  def render_error(message, status, code: nil)
    render json: { errors: { base: [ message ] }, code: code }.compact, status: status
  end
end
