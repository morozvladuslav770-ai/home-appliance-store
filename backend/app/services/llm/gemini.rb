require "net/http"
require "json"

# Клієнт Google Gemini API (без додаткових гемів): ключ GEMINI_API_KEY, модель GEMINI_MODEL
class Llm::Gemini
  DEFAULT_MODEL = "gemini-3.5-flash-lite"
  ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models".freeze

  def self.generate(system:, messages:, schema:)
    key = ENV["GEMINI_API_KEY"].presence or raise Llm::Unavailable, "GEMINI_API_KEY не задано"
    model = ENV["GEMINI_MODEL"].presence || DEFAULT_MODEL

    uri = URI("#{ENDPOINT}/#{model}:generateContent")
    request = Net::HTTP::Post.new(uri, "Content-Type" => "application/json", "x-goog-api-key" => key)
    request.body = {
      systemInstruction: { parts: [ { text: system } ] },
      contents: messages.map { |m| { role: m[:role] == "user" ? "user" : "model", parts: [ { text: m[:text] } ] } },
      generationConfig: { temperature: 0.4, responseMimeType: "application/json", responseSchema: schema }
    }.to_json

    response = Net::HTTP.start(uri.host, uri.port, use_ssl: true, open_timeout: 5, read_timeout: 30) do |http|
      http.request(request)
    end

    unless response.is_a?(Net::HTTPSuccess)
      Rails.logger.warn("[Gemini] #{model}: HTTP #{response.code} #{response.body.to_s.truncate(400)}")
      raise Llm::Failure.new("HTTP #{response.code}", status: response.code.to_i)
    end

    parts = JSON.parse(response.body).dig("candidates", 0, "content", "parts") || []
    text = parts.reject { |part| part["thought"] }.filter_map { |part| part["text"] }.join
    raise Llm::Failure, "Порожня відповідь" if text.blank?

    JSON.parse(text)
  rescue Net::OpenTimeout, Net::ReadTimeout, SocketError, SystemCallError, OpenSSL::SSL::SSLError, JSON::ParserError => e
    Rails.logger.warn("[Gemini] #{e.class}: #{e.message}")
    raise Llm::Failure, e.class.name
  end
end
