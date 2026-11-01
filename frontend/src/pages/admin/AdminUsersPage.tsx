import { useState } from "react";
import { api } from "../../api";
import { useAdminData } from "../../admin/useAdminData";
import { ROLE_LABEL, useAuth, type Role, type User } from "../../auth/context";

export default function AdminUsersPage() {
  const { user: me, token } = useAuth();
  const { data, error, reload } = useAdminData<User[]>("/admin/users");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const changeRole = async (u: User, role: Role) => {
    if (!window.confirm(`Змінити роль «${u.email}» на «${ROLE_LABEL[role]}»?`)) return;
    const result = await api(`/admin/users/${u.id}`, { method: "PATCH", token, body: { role } });
    if (result.ok) {
      setMessage({ ok: true, text: `${u.email}: ${ROLE_LABEL[role]}` });
    } else {
      setMessage({ ok: false, text: result.errors.base?.[0] ?? result.errors.role?.[0] ?? "Не вдалося змінити роль" });
    }
    reload();
  };

  return (
    <div className="admin-block">
      {message && (
        <p className={message.ok ? "alert-ok" : "form-errors"} role={message.ok ? "status" : "alert"}>
          {message.text}
        </p>
      )}
      {error && <p className="form-errors">{error}</p>}
      {data === null && !error && <p className="notice">Завантаження…</p>}

      {data && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Користувач</th>
                <th scope="col">Телефон</th>
                <th scope="col">Email підтверджено</th>
                <th scope="col">Роль</th>
              </tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id}>
                  <td>
                    {u.full_name}
                    <small>{u.email}</small>
                  </td>
                  <td>{u.phone ?? "—"}</td>
                  <td>{u.email_confirmed ? "Так" : "Ні"}</td>
                  <td>
                    <select
                      className="table-input"
                      value={u.role}
                      disabled={u.id === me?.id}
                      title={u.id === me?.id ? "Власну роль змінити не можна" : undefined}
                      aria-label={`Роль: ${u.email}`}
                      onChange={(e) => changeRole(u, e.target.value as Role)}
                    >
                      {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABEL[r]}
                        </option>
                      ))}
                    </select>
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
