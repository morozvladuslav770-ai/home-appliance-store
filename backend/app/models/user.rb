class User < ApplicationRecord
  MAX_FAILED_ATTEMPTS = 5  # FR-2.3
  LOCK_FOR = 15.minutes

  has_secure_password
  has_many :orders, dependent: :nullify

  enum :role, { buyer: "buyer", manager: "manager", admin: "admin" }, validate: true

  normalizes :email, with: ->(value) { value.strip.downcase }
  normalizes :full_name, with: ->(value) { value.strip.squish }
  normalizes :phone, with: ->(value) { value.strip }

  # Токени підписані ключем застосунку й не зберігаються в базі.
  # Блок прив'язує токен до стану: після зміни пароля старі токени сесії
  # та скидання перестають діяти.
  generates_token_for(:session, expires_in: 30.days) { password_salt&.last(10) }
  generates_token_for(:short_session, expires_in: 1.day) { password_salt&.last(10) }
  generates_token_for(:email_confirmation, expires_in: 2.days) { email }
  generates_token_for(:password_reset, expires_in: 30.minutes) { password_salt&.last(10) } # FR-2.4

  validates :full_name, presence: { message: "вкажіть ім'я та прізвище" }
  validates :email,
            format: { with: URI::MailTo::EMAIL_REGEXP, message: "вкажіть коректний email" },
            uniqueness: { message: "цей email вже зареєстровано" } # FR-1.2
  validates :phone, format: { with: /\A\+?[\d\s()\-]{10,18}\z/, message: "вкажіть коректний телефон" }
  validates :password_confirmation, presence: { message: "повторіть пароль" }, if: -> { password.present? }
  validate :password_strength, if: -> { password.present? }

  def self.find_by_session_token(token)
    return if token.blank?

    find_by_token_for(:session, token) || find_by_token_for(:short_session, token)
  end

  def email_confirmed?
    email_confirmed_at.present?
  end

  def confirm_email!
    update_columns(email_confirmed_at: Time.current) unless email_confirmed?
  end

  def staff?
    manager? || admin?
  end

  def locked?
    locked_until.present? && locked_until.future?
  end

  def register_failed_login!
    attempts = failed_attempts + 1
    if attempts >= MAX_FAILED_ATTEMPTS
      update_columns(failed_attempts: 0, locked_until: LOCK_FOR.from_now)
    else
      update_columns(failed_attempts: attempts)
    end
  end

  def reset_failed_logins!
    return if failed_attempts.zero? && locked_until.nil?

    update_columns(failed_attempts: 0, locked_until: nil)
  end

  def api_json
    {
      id: id,
      full_name: full_name,
      email: email,
      phone: phone,
      role: role,
      email_confirmed: email_confirmed?
    }
  end

  private

  # FR-1.3: щонайменше 8 символів, літери й цифри
  def password_strength
    return if password.match?(/\A(?=.*\p{L})(?=.*\d).{8,}\z/m)

    errors.add(:password, "щонайменше 8 символів, літери й цифри")
  end
end
