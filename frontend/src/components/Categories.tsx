import { useShop } from "../shop/context";
import Appliance from "./Appliance";

type Props = {
  active: string | null;
  onSelect: (name: string | null) => void;
};

export default function Categories({ active, onSelect }: Props) {
  const { categories } = useShop();
  return (
    <section className="section container" id="catalog" aria-labelledby="cat-title">
      <h2 id="cat-title">Категорії техніки</h2>
      <ul className="cats">
        {categories.map((c) => (
          <li key={c.name}>
            <button
              type="button"
              className={`cat ${active === c.name ? "is-active" : ""}`}
              aria-pressed={active === c.name}
              onClick={() => onSelect(active === c.name ? null : c.name)}
            >
              <Appliance kind={c.kind} className="appliance" />
              <span>{c.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
