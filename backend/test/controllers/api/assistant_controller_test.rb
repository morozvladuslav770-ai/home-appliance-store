require "test_helper"

class Api::AssistantControllerTest < ActionDispatch::IntegrationTest
  def with_gemini(behaviour)
    original = Llm.method(:generate)
    Llm.define_singleton_method(:generate) { |**_args| behaviour.call }
    yield
  ensure
    Llm.define_singleton_method(:generate, original)
  end

  def ask(text = "Потрібен холодильник для сім'ї з 4 осіб")
    post api_assistant_url, params: { messages: [ { role: "user", text: text } ] }, as: :json
  end

  test "повертає відповідь помічника й id рекомендованих товарів" do
    with_gemini(-> { { "reply" => "Раджу цей", "product_ids" => [ products(:fridge).id ] } }) { ask }

    assert_response :success
    assert_equal "Раджу цей", response.parsed_body["reply"]
    assert_equal [ products(:fridge).id ], response.parsed_body["product_ids"]
  end

  test "без повідомлень — 422" do
    post api_assistant_url, params: { messages: [] }, as: :json
    assert_response :unprocessable_entity
  end

  test "без ключа Gemini — 503 з кодом assistant_unavailable" do
    with_gemini(-> { raise Llm::Unavailable }) { ask }
    assert_response :service_unavailable
    assert_equal "assistant_unavailable", response.parsed_body["code"]
  end

  test "ліміт Gemini (429) — 429 з кодом assistant_busy" do
    with_gemini(-> { raise Llm::Failure.new("HTTP 429", status: 429) }) { ask }
    assert_response :too_many_requests
    assert_equal "assistant_busy", response.parsed_body["code"]
  end

  test "ключ відхилено (403) або моделі немає (404) — 503, а не 502" do
    [ 401, 403, 404 ].each do |status|
      with_gemini(-> { raise Llm::Failure.new("HTTP #{status}", status: status) }) { ask }
      assert_response :service_unavailable, "для HTTP #{status}"
      assert_equal "assistant_unavailable", response.parsed_body["code"]
    end
  end

  test "інша помилка Gemini — 502 з кодом assistant_failed, без технічних подробиць" do
    with_gemini(-> { raise Llm::Failure.new("HTTP 500", status: 500) }) { ask }
    assert_response :bad_gateway
    assert_equal "assistant_failed", response.parsed_body["code"]
    assert_not_includes response.body, "HTTP 500"
  end

  test "користувач без входу теж може спитати" do
    with_gemini(-> { { "reply" => "Вітаю", "product_ids" => [] } }) { ask("Привіт") }
    assert_response :success
  end
end
