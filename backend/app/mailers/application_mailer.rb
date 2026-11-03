class ApplicationMailer < ActionMailer::Base
  # Адреса відправника: MAIL_FROM, інакше SMTP_USER (Gmail вимагає свою адресу), інакше заглушка
  default from: ENV["MAIL_FROM"].presence ||
                (ENV["SMTP_USER"].present? ? "ТехноДім <#{ENV['SMTP_USER']}>" : "ТехноДім <no-reply@technodim.example>")
  layout "mailer"

  private

  def frontend_url
    Rails.configuration.x.frontend_url
  end
end
