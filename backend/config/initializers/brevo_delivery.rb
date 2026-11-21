require "net/http"
require "json"
require "uri"

class BrevoDeliveryMethod
  def initialize(settings = {})
    @settings = settings
  end

  def deliver!(mail)
    uri = URI("https://api.brevo.com/v3/smtp/email")

    sender = Mail::Address.new(ENV.fetch("MAIL_FROM"))

    raise "Invalid MAIL_FROM address" if sender.address.blank?

    payload = {
  sender: {
    name: sender.display_name.presence || "ТехноДім",
    email: sender.address
  },
      to: mail.to.map { |email| { email: email } },
      subject: mail.subject,
      textContent: mail.body.decoded
    }

    request = Net::HTTP::Post.new(uri)
    request["api-key"] = @settings.fetch(:api_key)
    request["Content-Type"] = "application/json"
    request.body = JSON.generate(payload)

    response = Net::HTTP.start(
      uri.host,
      uri.port,
      use_ssl: true,
      open_timeout: 10,
      read_timeout: 20
    ) do |http|
      http.request(request)
    end

    unless response.is_a?(Net::HTTPSuccess)
      raise "Brevo API error: #{response.code} #{response.body}"
    end

    response
  end
end

if ENV["BREVO_API_KEY"].present?
  ActionMailer::Base.add_delivery_method(
    :brevo,
    BrevoDeliveryMethod,
    api_key: ENV.fetch("BREVO_API_KEY")
  )
end
