# Єдина точка виклику мовної моделі. Провайдер обирається змінною AI_PROVIDER:
#   gemini (за замовчуванням) — Google Gemini, ключ GEMINI_API_KEY;
#   openai — будь-який OpenAI-сумісний сервіс (Groq, OpenRouter, Mistral…), див. env.example.
module Llm
  class Unavailable < StandardError; end # ключ не задано

  class Failure < StandardError # сервіс не відповів або відмовив
    attr_reader :status

    def initialize(message = "Помилка мовної моделі", status: nil)
      super(message)
      @status = status
    end
  end

  # messages: [{ role: "user" | "assistant", text: "…" }]
  # => розібраний JSON-об'єкт; schema описує його форму (використовує Gemini)
  def self.generate(system:, messages:, schema:)
    client.generate(system: system, messages: messages, schema: schema)
  end

  def self.client
    ENV["AI_PROVIDER"].to_s.downcase == "openai" ? Llm::OpenAiCompatible : Llm::Gemini
  end
end
