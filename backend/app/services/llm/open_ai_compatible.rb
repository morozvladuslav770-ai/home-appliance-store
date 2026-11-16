require "net/http"
require "json"

# Клієнт для OpenAI-сумісних сервісів (Groq, OpenRouter, Mistral…).
# Змінні: AI_API_KEY, AI_MODEL, AI_BASE_URL (за замовчуванням Groq).
class Llm::OpenAiCompatible
  DEFAULT_BASE_URL = "https://api.groq.com/openai/v1"
  DEFAULT_MODEL = "openai/gpt-oss-120b"

  def self.generate(system:, messages:, schema:) # schema тут не потрібна: форму JSON описано в промпті
    key = ENV["AI_API_KEY"].presence or raise Llm::Unavailable, "AI_API_KEY не задано"
    model = ENV["AI_MODEL"].presence || DEFAULT_MODEL
    base = (ENV["AI_BASE_URL"].presence || DEFAULT_BASE_URL).chomp("/")

    uri = URI("#{base}/chat/completions")
    request = Net::HTTP::Post.new(uri, "Content-Type" => "application/json", "Authorization" => "Bearer #{key}")
    request.body = {
      model: model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [ { role: "system", content: system } ] +
                messages.map { |m| { role: m[:role], content: m[:text] } }
    }.to_json

    response = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == "https", open_timeout: 5, read_timeout: 30) do |http|
      http.request(request)
    end

    unless response.is_a?(Net::HTTPSuccess)
      Rails.logger.warn("[AI] #{model}: HTTP #{response.code} #{response.body.to_s.truncate(400)}")
      raise Llm::Failure.new("HTTP #{response.code}", status: response.code.to_i)
    end

    text = JSON.parse(response.body).dig("choices", 0, "message", "content").to_s
    raise Llm::Failure, "Порожня відповідь" if text.blank?

    JSON.parse(text)
  rescue Net::OpenTimeout, Net::ReadTimeout, SocketError, SystemCallError, OpenSSL::SSL::SSLError, JSON::ParserError => e
    Rails.logger.warn("[AI] #{e.class}: #{e.message}")
    raise Llm::Failure, e.class.name
  end
end
