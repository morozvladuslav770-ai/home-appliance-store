import { Link, useNavigate } from "react-router-dom";
import { CATEGORIES } from "../data";
import { useAuth } from "../auth/context";
import { useCart, useShop } from "../shop/context";

const icon = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function Header() {
  const { filters, setFilters } = useShop();
  const { count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const goToCatalog = () => navigate("/", { state: { scroll: "all" } });

  const toggleCategory = (name: string) => {
    const next = filters.category === name ? null : name;
    setFilters((f) => ({ ...f, category: next }));
    if (next) goToCatalog();
  };

  return (
    <header className="header">
      <div className="header__top container">
        <Link
          className="logo"
          to="/"
          onClick={() => setFilters((f) => ({ ...f, category: null }))}
        >
          <svg viewBox="0 0 40 40" width="38" height="38" aria-hidden="true">
            <rect width="40" height="40" rx="9" fill="var(--cobalt)" />
            <path
              d="M9 20 20 10l11 10v11H9z"
              fill="none"
              stroke="#fff"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <rect x="16" y="21" width="8" height="10" rx="1.5" fill="var(--amber)" />
          </svg>
          <span>ТехноДім</span>
        </Link>

        <form
          className="search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            goToCatalog();
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...icon}>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={filters.query}
            onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
            placeholder="Пошук: холодильник, пральна машина…"
            aria-label="Пошук товарів"
          />
        </form>

        <nav className="actions" aria-label="Кабінет і кошик">
          <a className="action" href="#compare">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...icon}>
              <path d="M7 4v16M17 4v16M3 8h8M13 16h8" />
            </svg>
            <span>Порівняння</span>
          </a>
          <a className="action" href="#wishlist">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...icon}>
              <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
            </svg>
            <span>Бажане</span>
          </a>
          <Link className="action" to={user ? "/account" : "/login"}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...icon}>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c1-4 4-6 8-6s7 2 8 6" />
            </svg>
            <span>{user ? user.full_name.split(" ")[0] : "Увійти"}</span>
          </Link>
          <Link className="action action--cart" to="/cart">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...icon}>
              <path d="M3 4h2l2.4 11h10.2L20 7H6.2" />
              <circle cx="9" cy="19" r="1.4" />
              <circle cx="17" cy="19" r="1.4" />
            </svg>
            <span>Кошик</span>
            {count > 0 && (
              <b className="badge" aria-label={`Товарів у кошику: ${count}`}>
                {count}
              </b>
            )}
          </Link>
        </nav>
      </div>

      <nav className="catnav" aria-label="Категорії">
        <ul className="container">
          {CATEGORIES.map((c) => (
            <li key={c.name}>
              <button
                type="button"
                className={filters.category === c.name ? "is-active" : ""}
                aria-pressed={filters.category === c.name}
                onClick={() => toggleCategory(c.name)}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
