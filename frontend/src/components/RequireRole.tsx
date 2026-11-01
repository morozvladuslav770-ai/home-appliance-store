import { Outlet } from "react-router-dom";
import { useAuth, type Role } from "../auth/context";

// Доступ за роллю. Сервер перевіряє права самостійно; це лише зручність інтерфейсу
export default function RequireRole({ roles }: { roles: Role[] }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return (
      <section className="section container page-message">
        <h1>Недостатньо прав</h1>
        <p>Ця сторінка доступна лише користувачам з іншою роллю.</p>
      </section>
    );
  }
  return <Outlet />;
}
