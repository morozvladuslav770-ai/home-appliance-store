import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAdminData } from "../../admin/useAdminData";
import { useAuth } from "../../auth/context";
import Stars from "../../components/Stars";
import { useShop } from "../../shop/context";

type AdminReview = {
  id: number;
  rating: number;
  body: string;
  author: string;
  email: string;
  product: { id: number; name: string };
  created_at: string;
};

// Відгуки публікуються одразу; менеджер прибирає ті, що мають неприйнятний зміст
export default function AdminReviewsPage() {
  const { token } = useAuth();
  const { reload: reloadShop } = useShop();
  const { data, error, reload } = useAdminData<AdminReview[]>("/admin/reviews");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const remove = async (review: AdminReview) => {
    if (!window.confirm(`Видалити відгук користувача ${review.author}? Дію буде записано в журнал.`)) return;
    const result = await api(`/admin/reviews/${review.id}`, { method: "DELETE", token });
    if (result.ok) {
      setMessage({ ok: true, text: "Відгук видалено, рейтинг товару оновлено" });
      reload();
      reloadShop();
    } else {
      setMessage({ ok: false, text: result.errors.base?.[0] ?? "Не вдалося видалити відгук" });
    }
  };

  return (
    <div className="admin-block">
      <p className="panel__hint">Останні 200 відгуків. Видаляйте лише ті, що містять неприйнятний зміст.</p>
      {message && (
        <p className={message.ok ? "alert-ok" : "form-errors"} role={message.ok ? "status" : "alert"}>
          {message.text}
        </p>
      )}
      {error && <p className="form-errors">{error}</p>}
      {data === null && !error && <p className="notice">Завантаження…</p>}
      {data?.length === 0 && <p className="empty">Відгуків поки немає.</p>}

      {data && data.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Товар</th>
                <th scope="col">Автор</th>
                <th scope="col">Оцінка</th>
                <th scope="col">Відгук</th>
                <th scope="col">
                  <span className="sr-only">Дії</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link to={`/product/${r.product.id}`}>{r.product.name}</Link>
                    <small>{new Date(r.created_at).toLocaleString("uk-UA")}</small>
                  </td>
                  <td>
                    {r.author}
                    <small>{r.email}</small>
                  </td>
                  <td>
                    <Stars value={r.rating} />
                  </td>
                  <td className="review-text">{r.body}</td>
                  <td className="row-actions">
                    <button type="button" className="link link--danger" onClick={() => remove(r)}>
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
