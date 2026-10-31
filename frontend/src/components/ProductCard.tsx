import { formatPrice, kindOf, STATUS_LABEL, type Product } from "../data";
import Appliance from "./Appliance";

type Props = { product: Product; onAdd: (product: Product) => void };

export default function ProductCard({ product: p, onAdd }: Props) {
  const unavailable = p.status === "discontinued";

  return (
    <article className={`card ${unavailable ? "card--off" : ""}`}>
      <div className="card__media">
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} loading="lazy" />
        ) : (
          <Appliance kind={kindOf(p.category)} className="appliance" />
        )}
        {p.energy_class && (
          <span className="card__energy" title="Енергоклас">
            {p.energy_class}
          </span>
        )}
      </div>
      <div className="card__body">
        <span className="card__cat">
          {p.brand ? `${p.brand} · ${p.category}` : p.category}
        </span>
        <h3>{p.name}</h3>
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
            onClick={() => onAdd(p)}
          >
            У кошик
          </button>
        </div>
      </div>
    </article>
  );
}
