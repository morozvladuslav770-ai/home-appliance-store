import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAdminData } from "../../admin/useAdminData";
import { useAuth } from "../../auth/context";
import { formatPrice } from "../../data";
import {
  DELIVERY_LABEL,
  ORDER_STATUS_LABEL,
  PAYMENT_LABEL,
  type DeliveryMethod,
  type OrderStatus,
  type PaymentMethod,
} from "../../orders";
import { useShop } from "../../shop/context";

type AdminOrder = {
  id: number;
  status: OrderStatus;
  next_statuses: OrderStatus[];
  total: string;
  created_at: string;
  customer_name: string;
  email: string;
  phone: string;
  city: string;
  address: string | null;
  delivery_method: DeliveryMethod;
  payment_method: PaymentMethod;
  comment: string | null;
  items: { product_id: number; name: string; sku: string | null; unit_price: string; quantity: number }[];
};

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const { reload: reloadShop } = useShop();
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  const { data, error, reload } = useAdminData<AdminOrder[]>(
    `/admin/orders?status=${status}&q=${encodeURIComponent(applied)}`,
  );
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const change = async (order: AdminOrder, next: OrderStatus) => {
    const label = ORDER_STATUS_LABEL[next];
    if (next === "cancelled" && !window.confirm(`Скасувати замовлення №${order.id}? Товар повернеться на склад.`)) {
      return;
    }
    setBusyId(order.id);
    const result = await api(`/admin/orders/${order.id}`, { method: "PATCH", token, body: { status: next } });
    setBusyId(null);

    if (result.ok) {
      setMessage({ ok: true, text: `Замовлення №${order.id}: ${label}` });
      reload();
      if (next === "cancelled") reloadShop(); // склад змінився
    } else {
      setMessage({ ok: false, text: result.errors.base?.[0] ?? "Не вдалося змінити статус" });
    }
  };

  return (
    <div className="admin-block">
      <div className="toolbar">
        <form
          className="search search--inline"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setApplied(query);
          }}
        >
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="№ замовлення, ім'я, email, телефон"
            aria-label="Пошук замовлень"
          />
        </form>
        <label className="sort">
          Статус
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Усі</option>
            {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {message && (
        <p className={message.ok ? "alert-ok" : "form-errors"} role={message.ok ? "status" : "alert"}>
          {message.text}
        </p>
      )}
      {error && <p className="form-errors">{error}</p>}
      {data === null && !error && <p className="notice">Завантаження…</p>}
      {data?.length === 0 && <p className="empty">Замовлень не знайдено.</p>}

      <ul className="orders">
        {data?.map((o) => (
          <li className="order" key={o.id}>
            <div className="order__head">
              <strong>Замовлення №{o.id}</strong>
              <span className={`status status--${o.status}`}>{ORDER_STATUS_LABEL[o.status]}</span>
              <time dateTime={o.created_at}>{new Date(o.created_at).toLocaleString("uk-UA")}</time>
            </div>

            <p className="order__meta">
              {o.customer_name} · <a href={`tel:${o.phone}`}>{o.phone}</a> · <a href={`mailto:${o.email}`}>{o.email}</a>
            </p>
            <p className="order__meta">
              {DELIVERY_LABEL[o.delivery_method]}, {o.city}
              {o.address ? `, ${o.address}` : ""} · {PAYMENT_LABEL[o.payment_method]}
            </p>
            {o.comment && <p className="order__meta">Коментар: {o.comment}</p>}

            <ul className="order__items">
              {o.items.map((i) => (
                <li key={i.product_id}>
                  <Link to={`/product/${i.product_id}`}>{i.name}</Link>
                  <small>
                    {" "}
                    × {i.quantity} · {formatPrice(i.unit_price)}
                  </small>
                </li>
              ))}
            </ul>

            <div className="order__foot">
              <strong>{formatPrice(o.total)}</strong>
              <span className="row-actions">
                {o.next_statuses.length === 0 && <small>Статус остаточний</small>}
                {o.next_statuses.map((next) => (
                  <button
                    key={next}
                    type="button"
                    className={next === "cancelled" ? "link link--danger" : "btn btn--small"}
                    disabled={busyId === o.id}
                    onClick={() => change(o, next)}
                  >
                    {next === "cancelled" ? "Скасувати" : ORDER_STATUS_LABEL[next]}
                  </button>
                ))}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
