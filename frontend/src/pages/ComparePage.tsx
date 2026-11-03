import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import Appliance from "../components/Appliance";
import { formatPrice, kindOf, STATUS_LABEL, type Product } from "../data";
import { maxQty } from "../shop/cart";
import { MAX_COMPARE, useCart, useCompare } from "../shop/context";

type Row = { label: string; text: (p: Product) => string; cell?: (p: Product) => ReactNode };

const ROWS: Row[] = [
  { label: "Ціна", text: (p) => formatPrice(p.price), cell: (p) => <strong>{formatPrice(p.price)}</strong> },
  { label: "Бренд", text: (p) => p.brand ?? "—" },
  { label: "Категорія", text: (p) => p.category },
  { label: "Енергоклас", text: (p) => p.energy_class ?? "—" },
  { label: "Рейтинг", text: (p) => (p.rating ? `★ ${Number(p.rating).toFixed(1)}` : "—") },
  { label: "Наявність", text: (p) => STATUS_LABEL[p.status] },
  { label: "На складі", text: (p) => (p.status === "in_stock" ? `${p.stock_quantity} шт.` : "—") },
  { label: "Артикул", text: (p) => p.sku ?? "—" },
];

export default function ComparePage() {
  const { products, remove, clear } = useCompare();
  const { add } = useCart();
  const [onlyDiff, setOnlyDiff] = useState(false);

  if (products.length === 0) {
    return (
      <section className="section container page-message">
        <h1>Порівняння порожнє</h1>
        <p>
          Натискайте значок порівняння на картках товарів: можна обрати до {MAX_COMPARE} товарів і побачити їхні
          характеристики поруч.
        </p>
        <Link className="btn btn--primary" to="/">
          До каталогу
        </Link>
      </section>
    );
  }

  const differs = (row: Row) => new Set(products.map(row.text)).size > 1;
  const rows = onlyDiff ? ROWS.filter(differs) : ROWS;

  return (
    <section className="section container" aria-labelledby="compare-title">
      <div className="toolbar">
        <h1 className="h2" id="compare-title">
          Порівняння товарів
        </h1>
        <div className="row-actions">
          <label className="check">
            <input type="checkbox" checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} />
            Лише відмінності
          </label>
          <button type="button" className="link link--danger" onClick={clear}>
            Очистити
          </button>
        </div>
      </div>
      {products.length === 1 && <p className="panel__hint">Додайте ще хоча б один товар, щоб порівняти.</p>}

      <div className="table-wrap">
        <table className="table compare">
          <thead>
            <tr>
              <td />
              {products.map((p) => (
                <th scope="col" key={p.id}>
                  <Link className="compare__media" to={`/product/${p.id}`} aria-label={p.name}>
                    {p.image_url ? (
                      <img src={p.image_url} alt="" />
                    ) : (
                      <Appliance kind={kindOf(p.category)} className="appliance" />
                    )}
                  </Link>
                  <Link className="compare__name" to={`/product/${p.id}`}>
                    {p.name}
                  </Link>
                  <button type="button" className="link link--danger" onClick={() => remove(p.id)}>
                    Прибрати
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className={differs(row) ? "is-diff" : ""}>
                <th scope="row">{row.label}</th>
                {products.map((p) => (
                  <td key={p.id}>{row.cell ? row.cell(p) : row.text(p)}</td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={products.length + 1}>Усі характеристики збігаються.</td>
              </tr>
            )}
            <tr>
              <td />
              {products.map((p) => (
                <td key={p.id}>
                  <button
                    type="button"
                    className="btn btn--small"
                    disabled={maxQty(p) === 0}
                    onClick={() => add(p)}
                  >
                    У кошик
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
