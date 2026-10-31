import { Link } from "react-router-dom";
import { formatPrice, kindOf, STATUS_LABEL } from "../data";
import { maxQty } from "../shop/cart";
import { useCart } from "../shop/context";
import Appliance from "../components/Appliance";
import QtyStepper from "../components/QtyStepper";

export default function CartPage() {
  const { items, count, total, setQty, remove, clear } = useCart();

  const blocked = items.some((i) => maxQty(i.product) === 0);

  if (items.length === 0) {
    return (
      <section className="section container page-message">
        <h1>Кошик порожній</h1>
        <p>Додайте техніку з каталогу, і вона з'явиться тут.</p>
        <Link className="btn btn--primary" to="/" state={{ scroll: "all" }}>
          Перейти до каталогу
        </Link>
      </section>
    );
  }

  return (
    <section className="section container" aria-labelledby="cart-title">
      <div className="section__head">
        <h1 className="h2" id="cart-title">
          Кошик
        </h1>
        <button type="button" className="link" onClick={clear}>
          Очистити кошик
        </button>
      </div>

      <div className="cart">
        <ul className="cart__list">
          {items.map(({ product: p, qty }) => {
            const max = maxQty(p);
            return (
              <li className="cart__row" key={p.id}>
                <Link className="cart__thumb" to={`/product/${p.id}`} aria-label={p.name}>
                  {p.image_url ? (
                    <img src={p.image_url} alt="" />
                  ) : (
                    <Appliance kind={kindOf(p.category)} className="appliance" />
                  )}
                </Link>

                <div className="cart__name">
                  <Link to={`/product/${p.id}`}>{p.name}</Link>
                  <span>{p.brand ? `${p.brand} · ${p.sku ?? ""}` : p.sku}</span>
                  {max === 0 && (
                    <span className={`status status--${p.status}`}>
                      {STATUS_LABEL[p.status]}. Видаліть товар з кошика.
                    </span>
                  )}
                </div>

                <div className="cart__qty">
                  {max > 0 && (
                    <QtyStepper
                      label={`Кількість: ${p.name}`}
                      value={qty}
                      max={max}
                      onChange={(n) => setQty(p.id, n)}
                    />
                  )}
                </div>

                <div className="cart__sum">
                  <strong>{formatPrice(String(Number(p.price) * qty))}</strong>
                  {qty > 1 && <span>{formatPrice(p.price)} за шт.</span>}
                </div>

                <button
                  type="button"
                  className="link cart__remove"
                  onClick={() => remove(p.id)}
                  aria-label={`Видалити ${p.name}`}
                >
                  Видалити
                </button>
              </li>
            );
          })}
        </ul>

        <aside className="summary" aria-label="Підсумок замовлення">
          <h2>Разом</h2>
          <dl>
            <div>
              <dt>Товарів</dt>
              <dd>{count} шт.</dd>
            </div>
            <div>
              <dt>Доставка</dt>
              <dd>Розрахується під час оформлення</dd>
            </div>
          </dl>
          <p className="summary__total">
            <span>До сплати</span>
            <strong>{formatPrice(String(total))}</strong>
          </p>
          {blocked ? (
            <>
              <button type="button" className="btn btn--primary btn--block" disabled>
                Оформити замовлення
              </button>
              <p className="summary__hint">Видаліть з кошика недоступні товари.</p>
            </>
          ) : (
            <Link className="btn btn--primary btn--block" to="/checkout">
              Оформити замовлення
            </Link>
          )}
        </aside>
      </div>
    </section>
  );
}
