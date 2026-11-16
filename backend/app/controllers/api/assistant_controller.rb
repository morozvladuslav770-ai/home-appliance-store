# POST /api/assistant { messages: [{ role: "user" | "assistant", text }] }
# => { reply, product_ids }. Історія розмови зберігається на клієнті.
class Api::AssistantController < ApplicationController
  # Захищає безкоштовну квоту Gemini від зловживань
  rate_limit to: 6, within: 1.minute, store: Rails.cache, name: "assistant-minute"
  rate_limit to: 40, within: 1.hour, store: Rails.cache, name: "assistant-hour"

  def create
    messages = params.permit(messages: [ :role, :text ])[:messages]
    render json: ShoppingAssistant.new(messages).call
  rescue ShoppingAssistant::InvalidInput => e
    render_error(e.message, :unprocessable_entity)
  rescue GeminiClient::Unavailable
    render_error("Помічник тимчасово недоступний", :service_unavailable, code: "assistant_unavailable")
  rescue GeminiClient::Failure => e
    if e.status == 429
      render_error("Помічник зараз перевантажений. Спробуйте за хвилину.", :too_many_requests, code: "assistant_busy")
    else
      render_error("Не вдалося отримати відповідь. Спробуйте ще раз.", :bad_gateway, code: "assistant_failed")
    end
  end
end
