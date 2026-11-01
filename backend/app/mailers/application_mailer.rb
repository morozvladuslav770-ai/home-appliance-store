class ApplicationMailer < ActionMailer::Base
  default from: "ТехноДім <no-reply@technodim.example>"
  layout "mailer"

  private

  def frontend_url
    Rails.configuration.x.frontend_url
  end
end
