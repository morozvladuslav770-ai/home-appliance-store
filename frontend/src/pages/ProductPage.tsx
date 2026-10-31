import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatPrice, kindOf, STATUS_LABEL, type Product } from "../data";
import { maxQty } from "../shop/cart";
import { useCart, useShop } from "../shop/context";
import Appliance from "../components/Appliance";
import ProductCard from "../components/ProductCard";
import QtyStepper from "../components/QtyStepper";
import NotFound from "./NotFound";

function ProductView({ product: p }: { product: Product }) {
  const { products } = useShop();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const max = maxQty(p);
  const unavailable = max === 0;

  const specs: [string, string][] = [
    ["Бренд", p.brand ?? "—"],
    ["Категорія", p.category],
    ["Енергоклас", p.energy_class ?? "—"],
    ["Артикул", p.sku ?? "—"],
    ["Наявність", STATUS_LABEL[p.status]],
    ["На складі", p.status === "in_stock" ? `${p.stock_quantity} шт.` : "—"],
  ];

  const similar = products
    .filter((o) => o.category === p.category && o.id !== p.id)
    .slice(0, 4);

  return (
    <>
      <section className="container pp" aria-labelledby="pp-title">
        <nav className="crumbs" aria-label="Навігація">
          <Link to="/">Головна</Link>
          <span aria-hidden="true">/</span>
          <span>{p.category}</span>
        </nav>

        <div className="pp__grid">
          <div className="pp__media">
            {p.image_url ? (
              <img src={p.image_url} alt={p.name} />
            ) : (
              <Appliance kind={kindOf(p.category)} className="appliance" />
            )}
            {p.energy_class && (
              <span className="card__energy" title="Енергоклас">
                {p.energy_class}
              </span>
            )}
          </div>

          <div className="pp__info">
            {p.brand && <p className="pp__brand">{p.brand}</p>}
            <h1 id="pp-title">{p.name}</h1>
            <div className="pp__meta">
              {p.rating && (
                <span className="card__rating" aria-label={`Рейтинг ${p.rating} з 5`}>
                  ★ {Number(p.rating).toFixed(1)}
                </span>
              )}
              {p.sku && <span>Артикул: {p.sku}</span>}
              <span className={`status status--${p.status}`}>{STATUS_LABEL[p.status]}</span>
            </div>

            {p.description && <p className="pp__desc">{p.description}</p>}

            <div className="pp__buy">
              <strong className="pp__price">{formatPrice(p.price)}</strong>
              {unavailable ? (
                <p className="empty">Цей товар знято з продажу.</p>
              ) : (
                <div className="pp__actions">
                  <QtyStepper
                    label="Кількість"
                    value={qty}
                    max={max}
                    onChange={(n) => {
                      setQty(n);
                      setAdded(false);
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => {
                      add(p, qty);
                      setAdded(true);
                    }}
                  >
                    {added ? "Додано в кошик" : "У кошик"}
                  </button>
                  {added && (
                    <Link className="btn btn--ghost" to="/cart">
                      Перейти до кошика
                    </Link>
                  )}
                </div>
              )}
            </div>

            <table className="specs">
              <caption>Характеристики</caption>
              <tbody>
                {specs.map(([name, value]) => (
                  <tr key={name}>
                    <th scope="row">{name}</th>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="section container" aria-labelledby="similar-title">
          <h2 id="similar-title">Схожі товари</h2>
          <div className="products">
            {similar.map((o) => (
              <ProductCard key={o.id} product={o} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const { products, loading } = useShop();

  if (loading) return <p className="notice container">Завантаження товару…</p>;

  const product = products.find((p) => p.id === Number(id));
  if (!product) return <NotFound />;

  // key скидає кількість і стан «додано» під час переходу між товарами
  return <ProductView key={product.id} product={product} />;
}
