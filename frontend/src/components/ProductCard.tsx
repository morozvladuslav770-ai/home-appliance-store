import { Link } from "react-router-dom";
import { formatPrice, kindOf, STATUS_LABEL, type Product } from "../data";
import { useCart } from "../shop/context";
import Appliance from "./Appliance";

type Props = { product: Product };

export default function ProductCard({ product: p }: Props) {
  const { add } = useCart();
  const unavailable = p.status === "discontinued";

  return (
    <article className={`card ${unavailable ? "card--off" : ""}`}>
      <Link className="card__media" to={`/product/${p.id}`} aria-label={p.name}>
        {p.image_url ? (
          <img src={p.image_url} alt="" loading="lazy" />
        ) : (
          <Appliance kind={kindOf(p.category)} className="appliance" />
        )}
        {p.energy_class && (
          <span className="card__energy" title="Енергоклас">
            {p.energy_class}
          </span>
        )}
      </Link>
      <div className="card__body">
        <span className="card__cat">
          {p.brand ? `${p.brand} · ${p.category}` : p.category}
        </span>
        <h3>
          <Link to={`/product/${p.id}`}>{p.name}</Link>
        </h3>
        {p.rating && (
          <span className="card__rating" aria-label={`Рейтинг ${p.rating} з 5`}>
            ★ {Number(p.rating).toFixed(1)}
          </span>
        )}
        <p>{p.description}</p>
        <span className={`status status--${p.status}`}>{STATUS_LABEL[p.status]}</span>
        <div className="card__buy">
          <strong>{formatPrice(p.price)}</strong>
          <button
            type="button"
            className="btn btn--small"
            disabled={unavailable}
            onClick={() => add(p)}
          >
            У кошик
          </button>
        </div>
      </div>
    </article>
  );
}
