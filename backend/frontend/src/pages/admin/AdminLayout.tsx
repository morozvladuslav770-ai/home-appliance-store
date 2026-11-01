import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/context";

const TABS = [
  { to: "products", label: "Товари", adminOnly: false },
  { to: "categories", label: "Категорії", adminOnly: false },
  { to: "orders", label: "Замовлення", adminOnly: false },
  { to: "users", label: "Користувачі", adminOnly: true },
  { to: "audit", label: "Журнал дій", adminOnly: true },
];

export default function AdminLayout() {
  const { user } = useAuth();

  return (
    <section className="section container" aria-labelledby="admin-title">
      <h1 className="h2" id="admin-title">
        Адмін-панель
      </h1>
      <nav className="tabs" aria-label="Розділи панелі">
        {TABS.filter((t) => !t.adminOnly || user?.role === "admin").map((t) => (
          <NavLink key={t.to} to={t.to} className={({ isActive }) => (isActive ? "is-active" : "")}>
            {t.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </section>
  );
}
