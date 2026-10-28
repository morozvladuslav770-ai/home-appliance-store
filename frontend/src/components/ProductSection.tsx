import { formatPrice, kindOf, type Product } from "../data";
import Appliance from "./Appliance";

type Props = {
  id?: string;
  title: string;
  products: Product[];
  onAdd: (product: Product) => void;
  emptyText?: string;
  action?: { label: string; onClick: () => void };
};

export default function ProductSection({
  id,
  title,
  products,
  onAdd,
  emptyText,
  action,
}: Props) {
  return (
    <section className="section container" id={id} aria-labelledby={`${id}-title`}>
      <div className="section__head">
        <h2 id={`${id}-title`}>{title}</h2>
        {action && (
          <button type="button" className="link" onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <p className="empty">{emptyText}</p>
      ) : (
        <div className="products">
          {products.map((p) => (
            <article className="card" key={p.id}>
              <div className="card__media">
                <Appliance kind={kindOf(p.category)} className="appliance" />
                {p.energy_class && (
                  <span className="card__energy" title="Енергоклас">
                    {p.energy_class}
                  </span>
                )}
              </div>
              <div className="card__body">
                <span className="card__cat">{p.category}</span>
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <div className="card__buy">
                  <strong>{formatPrice(p.price)}</strong>
                  <button type="button" className="btn btn--small" onClick={() => onAdd(p)}>
                    У кошик
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
