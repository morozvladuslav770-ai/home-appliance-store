import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/context";
import Field from "../components/Field";
import { formatPrice } from "../data";
import {
  DELIVERY_LABEL,
  EMPTY_ORDER_FORM,
  PAYMENT_LABEL,
  submitOrder,
  type DeliveryMethod,
  type FieldErrors,
  type OrderForm,
  type PaymentMethod,
} from "../orders";
import { maxQty } from "../shop/cart";
import { useCart, useShop } from "../shop/context";

export default function CheckoutPage() {
  const { items, count, total, clear } = useCart();
  const { demo } = useShop();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<OrderForm>({
    ...EMPTY_ORDER_FORM,
    customer_name: user?.full_name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);

  if (items.length === 0) {
    return (
      <section className="section container page-message">
        <h1>Немає що оформлювати</h1>
        <p>Кошик порожній. Додайте техніку з каталогу.</p>
        <Link className="btn btn--primary" to="/" state={{ scroll: "all" }}>
          Перейти до каталогу
        </Link>
      </section>
    );
  }

  const unavailable = items.some((i) => maxQty(i.product) === 0);
  const set = <K extends keyof OrderForm>(key: K, value: OrderForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const needsAddress = form.delivery_method !== "pickup";

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    setErrors({});
    const result = await submitOrder(form, items, token);
    setSending(false);

    if (result.ok) {
      clear();
      navigate("/order/success", { state: { order: result.order }, replace: true });
    } else {
      setErrors(result.errors);
    }
  };

  return (
    <section className="section container" aria-labelledby="checkout-title">
      <h1 className="h2" id="checkout-title">
        Оформлення замовлення
      </h1>

      {demo && (
        <p className="notice" role="alert">
          Сервер недоступний, тому замовлення зараз не можна відправити. Запустіть Rails API на
          порту 3000.
        </p>
      )}

      <form className="checkout" onSubmit={onSubmit} noValidate>
        <div className="checkout__fields">
          {errors.base && (
            <ul className="form-errors" role="alert">
              {errors.base.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}

          <fieldset className="panel">
            <legend>Контакти</legend>
            <Field label="Ім'я та прізвище" error={errors.customer_name}>
              <input
                value={form.customer_name}
                autoComplete="name"
                onChange={(e) => set("customer_name", e.target.value)}
              />
            </Field>
            <div className="panel__row">
              <Field label="Email" error={errors.email}>
                <input
                  type="email"
                  value={form.email}
                  autoComplete="email"
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>
              <Field label="Телефон" error={errors.phone}>
                <input
                  type="tel"
                  value={form.phone}
                  placeholder="+380"
                  autoComplete="tel"
                  onChange={(e) => set("phone", e.target.value)}
                />
              </Field>
            </div>
          </fieldset>

          <fieldset className="panel">
            <legend>Доставка</legend>
            <div className="options">
              {(Object.keys(DELIVERY_LABEL) as DeliveryMethod[]).map((key) => (
                <label className="option" key={key}>
                  <input
                    type="radio"
                    name="delivery"
                    checked={form.delivery_method === key}
                    onChange={() => set("delivery_method", key)}
                  />
                  {DELIVERY_LABEL[key]}
                </label>
              ))}
            </div>
            {errors.delivery_method && (
              <small className="field__error">{errors.delivery_method[0]}</small>
            )}
            <Field label="Місто" error={errors.city}>
              <input
                value={form.city}
                autoComplete="address-level2"
                onChange={(e) => set("city", e.target.value)}
              />
            </Field>
            {needsAddress && (
              <Field
                label={form.delivery_method === "courier" ? "Адреса доставки" : "Відділення"}
                error={errors.address}
              >
                <input
                  value={form.address}
                  autoComplete="street-address"
                  onChange={(e) => set("address", e.target.value)}
                />
              </Field>
            )}
            <p className="panel__hint">
              Вартість і термін доставки менеджер уточнить після оформлення.
            </p>
          </fieldset>

          <fieldset className="panel">
            <legend>Оплата</legend>
            <div className="options">
              {(Object.keys(PAYMENT_LABEL) as PaymentMethod[]).map((key) => (
                <label className="option" key={key}>
                  <input
                    type="radio"
                    name="payment"
                    checked={form.payment_method === key}
                    onChange={() => set("payment_method", key)}
                  />
                  {PAYMENT_LABEL[key]}
                </label>
              ))}
            </div>
            {form.payment_method === "card_online" && (
              <p className="panel__hint">
                Онлайн-оплату ще не підключено: замовлення збережеться зі статусом «Очікує
                оплати», і менеджер зв'яжеться з вами.
              </p>
            )}
          </fieldset>

          <Field label="Коментар до замовлення (необов'язково)">
            <textarea
              rows={3}
              value={form.comment}
              onChange={(e) => set("comment", e.target.value)}
            />
          </Field>
        </div>

        <aside className="summary" aria-label="Ваше замовлення">
          <h2>Ваше замовлення</h2>
          <ul className="summary__items">
            {items.map(({ product: p, qty }) => (
              <li key={p.id}>
                <span>
                  {p.name}
                  <small> × {qty}</small>
                </span>
                <strong>{formatPrice(String(Number(p.price) * qty))}</strong>
              </li>
            ))}
          </ul>
          <p className="summary__total">
            <span>{count} шт., до сплати</span>
            <strong>{formatPrice(String(total))}</strong>
          </p>
          <button
            type="submit"
            className="btn btn--primary btn--block"
            disabled={sending || demo || unavailable}
          >
            {sending ? "Відправляємо…" : "Підтвердити замовлення"}
          </button>
          {unavailable && (
            <p className="summary__hint">
              У кошику є недоступні товари. <Link to="/cart">Видаліть їх</Link>, щоб продовжити.
            </p>
          )}
        </aside>
      </form>
    </section>
  );
}
