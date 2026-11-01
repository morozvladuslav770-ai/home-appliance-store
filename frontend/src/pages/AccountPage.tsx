import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { ROLE_LABEL, useAuth } from "../auth/context";
import { formatPrice } from "../data";
import { DELIVERY_LABEL, ORDER_STATUS_LABEL, PAYMENT_LABEL, type OrderResponse } from "../orders";

export default function AccountPage() {
  const { user, token, logout } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<OrderResponse[]>("/orders", { token }).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setOrders(result.data);
      } else if (result.status === 401) {
        logout(); // токен більше не дійсний
      } else {
        setError(result.errors.base?.[0] ?? "Не вдалося завантажити замовлення");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  if (!user) return null;

  const cancel = async (id: number) => {
    if (!window.confirm("Скасувати це замовлення?")) return;
    setBusyId(id);
    setError("");
    const result = await api<OrderResponse>(`/orders/${id}/cancel`, { method: "PATCH", token });
    setBusyId(null);

    if (result.ok) {
      setOrders((list) => list?.map((o) => (o.id === id ? result.data : o)) ?? null);
    } else {
      setError(result.errors.base?.[0] ?? "Не вдалося скасувати замовлення");
    }
  };

  return (
    <section className="section container" aria-labelledby="account-title">
      <div className="section__head">
        <h1 className="h2" id="account-title">
          Особистий кабінет
        </h1>
        <button type="button" className="link" onClick={logout}>
          Вийти
        </button>
      </div>

      <div className="account">
        <aside className="panel profile" aria-label="Профіль">
          <h2>{user.full_name}</h2>
          <dl>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Телефон</dt>
              <dd>{user.phone ?? "—"}</dd>
            </div>
            <div>
              <dt>Роль</dt>
              <dd>{ROLE_LABEL[user.role]}</dd>
            </div>
          </dl>
          {user.role !== "buyer" && (
            <p className="panel__hint">
              Інструменти для роботи з каталогом і замовленнями з'являться в адмін-панелі.
            </p>
          )}
        </aside>

        <div>
          <h2 className="account__title">Історія замовлень</h2>
          {error && (
            <p className="form-errors" role="alert">
              {error}
            </p>
          )}

          {orders === null && !error && <p className="notice">Завантаження…</p>}

          {orders?.length === 0 && (
            <div className="page-message">
              <p>Замовлень поки немає.</p>
              <Link className="btn btn--primary" to="/" state={{ scroll: "all" }}>
                Перейти до каталогу
              </Link>
            </div>
          )}

          <ul className="orders">
            {orders?.map((o) => (
              <li className="order" key={o.id}>
                <div className="order__head">
                  <strong>Замовлення №{o.id}</strong>
                  <span className={`status status--${o.status}`}>{ORDER_STATUS_LABEL[o.status]}</span>
                  <time dateTime={o.created_at}>
                    {new Date(o.created_at).toLocaleDateString("uk-UA")}
                  </time>
                </div>
                <ul className="order__items">
                  {o.items.map((i) => (
                    <li key={i.product_id}>
                      <Link to={`/product/${i.product_id}`}>{i.name}</Link>
                      <small> × {i.quantity}</small>
                    </li>
                  ))}
                </ul>
                <p className="order__meta">
                  {DELIVERY_LABEL[o.delivery_method]}, {o.city} · {PAYMENT_LABEL[o.payment_method]}
                </p>
                <div className="order__foot">
                  <strong>{formatPrice(o.total)}</strong>
                  {o.cancellable && (
                    <button
                      type="button"
                      className="link"
                      disabled={busyId === o.id}
                      onClick={() => cancel(o.id)}
                    >
                      {busyId === o.id ? "Скасовуємо…" : "Скасувати замовлення"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
