import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/context";

// Сторінки лише для увійдених користувачів; після входу повертаємо на потрібну сторінку
export default function RequireAuth() {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();

  if (loading) return <p className="notice container">Завантаження…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: pathname }} />;
  return <Outlet />;
}
