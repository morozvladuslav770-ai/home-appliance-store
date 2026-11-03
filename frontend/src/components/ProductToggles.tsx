import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/context";
import type { Product } from "../data";
import { useCompare, useWishlist } from "../shop/context";

const icon = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function WishlistButton({ product }: { product: Product }) {
  const { user } = useAuth();
  const { has, toggle } = useWishlist();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = has(product.id);

  const onClick = () => {
    // FR-4.4: бажане доступне лише зареєстрованим — відправляємо входити й повертаємо назад
    if (!user) navigate("/login", { state: { from: pathname } });
    else void toggle(product.id);
  };

  return (
    <button
      type="button"
      className={`tool ${active ? "is-active" : ""}`}
      aria-pressed={active}
      aria-label={active ? `Прибрати «${product.name}» з бажаного` : `Додати «${product.name}» у бажане`}
      title={user ? (active ? "Прибрати з бажаного" : "У бажане") : "Увійдіть, щоб зберегти в бажане"}
      onClick={onClick}
    >
      <svg {...icon} fill={active ? "currentColor" : "none"}>
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
      </svg>
    </button>
  );
}

export function CompareButton({ product }: { product: Product }) {
  const { has, full, toggle } = useCompare();
  const active = has(product.id);
  const blocked = full && !active;

  return (
    <button
      type="button"
      className={`tool ${active ? "is-active" : ""}`}
      aria-pressed={active}
      aria-label={active ? `Прибрати «${product.name}» з порівняння` : `Порівняти «${product.name}»`}
      title={blocked ? "У порівнянні вже 4 товари" : active ? "Прибрати з порівняння" : "Порівняти"}
      disabled={blocked}
      onClick={() => toggle(product.id)}
    >
      <svg {...icon} fill="none">
        <path d="M7 4v16M17 4v16M3 8h8M13 16h8" />
      </svg>
    </button>
  );
}
