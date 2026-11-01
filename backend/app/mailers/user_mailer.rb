class UserMailer < ApplicationMailer
  def confirmation(user)
    @user = user
    token = CGI.escape(user.generate_token_for(:email_confirmation))
    @url = "#{frontend_url}/confirm-email?token=#{token}"
    mail to: user.email, subject: "Підтвердьте email у ТехноДім"
  end

  def password_reset(user)
    @user = user
    token = CGI.escape(user.generate_token_for(:password_reset))
    @url = "#{frontend_url}/reset-password?token=#{token}"
    mail to: user.email, subject: "Відновлення пароля в ТехноДім"
  end
end
