import { useAdminData } from "../../admin/useAdminData";
import { ACTION_LABEL, describeDetails } from "../../admin/labels";
import { ROLE_LABEL, type Role } from "../../auth/context";

type Entry = {
  id: number;
  action: string;
  summary: string | null;
  details: Record<string, unknown>;
  actor: string | null;
  actor_role: Role | null;
  created_at: string;
};

export default function AdminAuditPage() {
  const { data, error } = useAdminData<Entry[]>("/admin/audit_logs");

  return (
    <div className="admin-block">
      <p className="panel__hint">Останні 200 дій у панелі: зміни товарів і цін, категорій, статусів замовлень та ролей.</p>
      {error && <p className="form-errors">{error}</p>}
      {data === null && !error && <p className="notice">Завантаження…</p>}
      {data?.length === 0 && <p className="empty">Записів поки немає.</p>}

      {data && data.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Коли</th>
                <th scope="col">Хто</th>
                <th scope="col">Дія</th>
                <th scope="col">Подробиці</th>
              </tr>
            </thead>
            <tbody>
              {data.map((e) => (
                <tr key={e.id}>
                  <td>
                    <time dateTime={e.created_at}>{new Date(e.created_at).toLocaleString("uk-UA")}</time>
                  </td>
                  <td>
                    {e.actor ?? "Видалений користувач"}
                    {e.actor_role && <small>{ROLE_LABEL[e.actor_role]}</small>}
                  </td>
                  <td>
                    {ACTION_LABEL[e.action] ?? e.action}
                    {e.summary && <small>{e.summary}</small>}
                  </td>
                  <td>{describeDetails(e.action, e.details)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
