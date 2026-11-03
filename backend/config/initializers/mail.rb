# Справжня пошта вмикається, коли задано SMTP_USER (див. env.example).
# Без нього: у development листи пишуться у файли tmp/mails, у test — у пам'ять.
if ENV["SMTP_USER"].present? && !Rails.env.test?
  Rails.application.config.action_mailer.tap do |mailer|
    mailer.delivery_method = :smtp
    mailer.raise_delivery_errors = true
    mailer.smtp_settings = {
      address: ENV.fetch("SMTP_ADDRESS", "smtp.gmail.com"),
      port: ENV.fetch("SMTP_PORT", "587").to_i,
      user_name: ENV["SMTP_USER"],
      # пароль застосунку Google показується з пробілами — вони не потрібні
      password: ENV["SMTP_PASSWORD"].to_s.delete(" "),
      authentication: :plain,
      enable_starttls_auto: true
    }
  end
end
