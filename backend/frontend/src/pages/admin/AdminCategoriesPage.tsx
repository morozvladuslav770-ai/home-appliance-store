import { useState, type FormEvent } from "react";
import { api } from "../../api";
import { useAdminData } from "../../admin/useAdminData";
import { useAuth } from "../../auth/context";
import { useShop } from "../../shop/context";

type AdminCategory = { id: number; name: string; position: number; products_count: number };

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const { reload: reloadShop } = useShop();
  const { data, error, reload } = useAdminData<AdminCategory[]>("/admin/categories");
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const done = (text: string) => {
    setMessage({ ok: true, text });
    reload();
    reloadShop();
  };

  const fail = (errors: Record<string, string[]>) =>
    setMessage({ ok: false, text: errors.name?.[0] ?? errors.base?.[0] ?? "Не вдалося виконати дію" });

  const create = async (event: FormEvent) => {
    event.preventDefault();
    const result = await api("/admin/categories", { method: "POST", token, body: { name: newName } });
    if (result.ok) {
      setNewName("");
      done("Категорію додано");
    } else {
      fail(result.errors);
    }
  };

  const rename = async (id: number) => {
    const result = await api(`/admin/categories/${id}`, { method: "PATCH", token, body: { name: editName } });
    if (result.ok) {
      setEditId(null);
      done("Категорію перейменовано, товари оновлено");
    } else {
      fail(result.errors);
    }
  };

  const remove = async (c: AdminCategory) => {
    if (!window.confirm(`Видалити категорію «${c.name}»?`)) return;
    const result = await api(`/admin/categories/${c.id}`, { method: "DELETE", token });
    if (result.ok) done("Категорію видалено");
    else fail(result.errors);
  };

  return (
    <div className="admin-block">
      <form className="toolbar" onSubmit={create}>
        <label className="search search--inline">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Назва нової категорії"
            aria-label="Назва нової категорії"
          />
        </label>
        <button type="submit" className="btn btn--primary" disabled={!newName.trim()}>
          Додати категорію
        </button>
      </form>

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
                <th scope="col">Категорія</th>
                <th scope="col" className="num">Товарів</th>
                <th scope="col">
                  <span className="sr-only">Дії</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id}>
                  <td>
                    {editId === c.id ? (
                      <input
                        className="table-input"
                        value={editName}
                        autoFocus
                        aria-label={`Нова назва для ${c.name}`}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      c.name
                    )}
                  </td>
                  <td className="num">{c.products_count}</td>
                  <td className="row-actions">
                    {editId === c.id ? (
                      <>
                        <button type="button" className="link" onClick={() => rename(c.id)}>
                          Зберегти
                        </button>
                        <button type="button" className="link" onClick={() => setEditId(null)}>
                          Скасувати
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="link"
                          onClick={() => {
                            setEditId(c.id);
                            setEditName(c.name);
                            setMessage(null);
                          }}
                        >
                          Перейменувати
                        </button>
                        <button
                          type="button"
                          className="link link--danger"
                          disabled={c.products_count > 0}
                          title={c.products_count > 0 ? "У категорії є товари" : undefined}
                          onClick={() => remove(c)}
                        >
                          Видалити
                        </button>
                      </>
                    )}
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
