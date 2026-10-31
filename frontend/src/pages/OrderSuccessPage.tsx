import { Link, Navigate, useLocation } from "react-router-dom";
import { formatPrice } from "../data";
import {
  DELIVERY_LABEL,
  ORDER_STATUS_LABEL,
  PAYMENT_LABEL,
  type OrderResponse,
} from "../orders";

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const order = (state as { order?: OrderResponse } | null)?.order;

  // Сторінку відкрито напряму або оновлено — даних замовлення вже немає
  if (!order) return <Navigate to="/" replace />;

  return (
    <section className="section container success" aria-labelledby="success-title">
      <h1 className="h2" id="success-title">
        Замовлення №{order.id} прийнято
      </h1>
      <p className="success__lead">
        Підтвердження надійде на {order.email}. Менеджер зв'яжеться з вами, щоб уточнити доставку.
      </p>

      <dl className="success__facts">
        <div>
          <dt>Статус</dt>
          <dd>{ORDER_STATUS_LABEL[order.status]}</dd>
        </div>
        <div>
          <dt>Доставка</dt>
          <dd>
            {DELIVERY_LABEL[order.delivery_method]}, {order.city}
            {order.address ? `, ${order.address}` : ""}
          </dd>
        </div>
        <div>
          <dt>Оплата</dt>
          <dd>{PAYMENT_LABEL[order.payment_method]}</dd>
        </div>
      </dl>

      <ul className="summary__items success__items">
        {order.items.map((i) => (
          <li key={i.product_id}>
            <span>
              {i.name}
              <small> × {i.quantity}</small>
            </span>
            <strong>{formatPrice(String(Number(i.unit_price) * i.quantity))}</strong>
          </li>
        ))}
      </ul>
      <p className="summary__total success__total">
        <span>Разом</span>
        <strong>{formatPrice(order.total)}</strong>
      </p>

      <Link className="btn btn--primary" to="/">
        Повернутися до магазину
      </Link>
    </section>
  );
}
