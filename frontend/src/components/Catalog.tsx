import type { Product } from "../data";
import { SORT_LABEL, type Filters, type SortKey } from "../filters";
import FilterPanel from "./FilterPanel";
import ProductCard from "./ProductCard";

type Props = {
  allProducts: Product[];
  shown: Product[];
  filters: Filters;
  onChange: (next: Filters) => void;
  onAdd: (product: Product) => void;
};

export default function Catalog({ allProducts, shown, filters, onChange, onAdd }: Props) {
  return (
    <section className="section container" id="all" aria-labelledby="all-title">
      <div className="section__head">
        <h2 id="all-title">{filters.category ?? "Весь каталог"}</h2>
        <label className="sort">
          Сортування
          <select
            value={filters.sort}
            onChange={(e) => onChange({ ...filters, sort: e.target.value as SortKey })}
          >
            {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABEL[k]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="catalog">
        <FilterPanel products={allProducts} filters={filters} onChange={onChange} />
        <div>
          <p className="found" role="status">
            Знайдено товарів: {shown.length}
          </p>
          {shown.length === 0 ? (
            <p className="empty">
              Нічого не знайдено. Змініть фільтри або натисніть «Скинути фільтри».
            </p>
          ) : (
            <div className="products products--3">
              {shown.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={onAdd} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
