# Справжня пошта вмикається, коли задано SMTP_USER (див. env.example).
# Без нього: у development листи пишуться у файли tmp/mails, у test — у пам'ять.
if ENV["SMTP_USERNAME"].present? && !Rails.env.test?
  Rails.application.config.action_mailer.tap do |mailer|
    mailer.delivery_method = :smtp
    mailer.raise_delivery_errors = true
    mailer.smtp_settings = {
      address: ENV.fetch("SMTP_ADDRESS"),
      port: ENV.fetch("SMTP_PORT", "587").to_i,
      user_name: ENV.fetch("SMTP_USERNAME"),
      password: ENV.fetch("SMTP_PASSWORD"),
      authentication: :plain,
      enable_starttls_auto: true
    }
  end
end
