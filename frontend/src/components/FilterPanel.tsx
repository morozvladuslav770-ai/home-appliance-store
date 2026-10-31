import { CATEGORIES, type Product } from "../data";
import { activeCount, EMPTY_FILTERS, type Filters } from "../filters";

type Props = {
  products: Product[];
  filters: Filters;
  onChange: (next: Filters) => void;
};

const ENERGY = ["A", "B", "C", "D"];

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function FilterPanel({ products, filters, onChange }: Props) {
  const brands = [...new Set(products.map((p) => p.brand).filter((b): b is string => !!b))].sort();
  const count = activeCount(filters);
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <aside className="filters" aria-label="Фільтри">
      <fieldset>
        <legend>Категорія</legend>
        <ul className="tree">
          <li>
            <button
              type="button"
              className={filters.category === null ? "is-active" : ""}
              onClick={() => set({ category: null })}
            >
              Уся техніка
            </button>
          </li>
          {CATEGORIES.map((c) => (
            <li key={c.name}>
              <button
                type="button"
                className={filters.category === c.name ? "is-active" : ""}
                onClick={() => set({ category: c.name })}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset>
        <legend>Бренд</legend>
        {brands.map((b) => (
          <label className="check" key={b}>
            <input
              type="checkbox"
              checked={filters.brands.includes(b)}
              onChange={() => set({ brands: toggle(filters.brands, b) })}
            />
            {b}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Ціна, грн</legend>
        <div className="range">
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="від"
            aria-label="Ціна від"
            value={filters.minPrice}
            onChange={(e) => set({ minPrice: e.target.value })}
          />
          <span aria-hidden="true">—</span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="до"
            aria-label="Ціна до"
            value={filters.maxPrice}
            onChange={(e) => set({ maxPrice: e.target.value })}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend>Енергоклас</legend>
        <div className="chips">
          {ENERGY.map((c) => (
            <label className={`chip ${filters.energy.includes(c) ? "is-on" : ""}`} key={c}>
              <input
                type="checkbox"
                checked={filters.energy.includes(c)}
                onChange={() => set({ energy: toggle(filters.energy, c) })}
              />
              {c}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Наявність і рейтинг</legend>
        <label className="check">
          <input
            type="checkbox"
            checked={filters.availableOnly}
            onChange={(e) => set({ availableOnly: e.target.checked })}
          />
          Без знятих з продажу
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={filters.minRating >= 4}
            onChange={(e) => set({ minRating: e.target.checked ? 4 : 0 })}
          />
          Рейтинг від 4
        </label>
      </fieldset>

      <button
        type="button"
        className="btn btn--ghost btn--block"
        disabled={count === 0}
        onClick={() => onChange({ ...EMPTY_FILTERS, sort: filters.sort })}
      >
        Скинути фільтри{count > 0 ? ` (${count})` : ""}
      </button>
    </aside>
  );
}
