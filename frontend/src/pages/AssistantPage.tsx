import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { api } from "../api";
import ProductCard from "../components/ProductCard";
import { useShop } from "../shop/context";

type Message = { role: "user" | "assistant"; text: string; productIds?: number[] };
type Reply = { reply: string; product_ids: number[] };

const EXAMPLES = [
  "Потрібен холодильник для сім'ї з 4 осіб, ніша 60 см завширшки, бюджет до 25 000 грн",
  "Яку пральну машину взяти для маленької ванної, стираємо щодня?",
  "Підберіть плиту й витяжку для кухні 9 м², готуємо багато",
];

// Підбір техніки з ШІ: покупець описує, що потрібно, а помічник уточнює деталі й радить товари з каталогу
export default function AssistantPage() {
  const { products } = useShop();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0 || sending) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending, error]);

  // Надсилає розмову (яка закінчується репліками покупця) і додає відповідь помічника
  const request = async (conversation: Message[]) => {
    setSending(true);
    setError("");
    const result = await api<Reply>("/assistant", {
      method: "POST",
      body: { messages: conversation.map(({ role, text }) => ({ role, text })) },
    });
    setSending(false);

    if (result.ok) {
      setMessages([...conversation, { role: "assistant", text: result.data.reply, productIds: result.data.product_ids }]);
    } else {
      setError(result.errors.base?.[0] ?? "Не вдалося отримати відповідь. Спробуйте ще раз.");
    }
  };

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    const conversation: Message[] = [...messages, { role: "user", text: trimmed }];
    setMessages(conversation);
    setInput("");
    void request(conversation);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send(input);
    }
  };

  const byId = new Map(products.map((p) => [p.id, p]));

  return (
    <section className="section container assistant" aria-labelledby="assistant-title">
      <h1 className="h2" id="assistant-title">
        Підбір техніки з ШІ
      </h1>
      <p className="assistant__lead">
        Опишіть, яка техніка вам потрібна: розміри місця, склад родини, бюджет, як користуватиметесь. Помічник
        уточнить деталі й порадить товари з нашого каталогу.
      </p>

      <div className="chat" aria-live="polite">
        {messages.length === 0 && (
          <div className="chat__examples">
            <p>Наприклад:</p>
            {EXAMPLES.map((example) => (
              <button type="button" key={example} className="chat__example" onClick={() => send(example)}>
                {example}
              </button>
            ))}
          </div>
        )}

        {messages.map((message, i) => {
          const recommended = (message.productIds ?? []).flatMap((id) => byId.get(id) ?? []);
          return (
            <div key={i} className={`chat__row chat__row--${message.role}`}>
              <p className="chat__bubble">
                <span className="sr-only">{message.role === "user" ? "Ви: " : "Помічник: "}</span>
                {message.text}
              </p>
              {recommended.length > 0 && (
                <div className="chat__products">
                  {recommended.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {sending && (
          <div className="chat__row chat__row--assistant">
            <p className="chat__bubble chat__bubble--typing" role="status">
              Помічник думає…
            </p>
          </div>
        )}

        {error && (
          <div className="form-errors" role="alert">
            {error}{" "}
            <button type="button" className="link" onClick={() => void request(messages)}>
              Спробувати ще раз
            </button>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="chat__form"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <label className="sr-only" htmlFor="chat-input">
          Ваше повідомлення
        </label>
        <textarea
          id="chat-input"
          rows={2}
          maxLength={1500}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Опишіть, що шукаєте… (Enter — надіслати, Shift+Enter — новий рядок)"
        />
        <div className="row-actions">
          <button type="submit" className="btn btn--primary" disabled={sending || !input.trim()}>
            Надіслати
          </button>
          {messages.length > 0 && (
            <button
              type="button"
              className="btn btn--ghost"
              disabled={sending}
              onClick={() => {
                setMessages([]);
                setError("");
              }}
            >
              Почати спочатку
            </button>
          )}
        </div>
      </form>

      <p className="panel__hint">
        Помічник працює на ШІ й може помилятися: перевіряйте характеристики й розміри на сторінці товару. Не вводьте
        особисті дані (ім'я, адресу, телефон).
      </p>
    </section>
  );
}
