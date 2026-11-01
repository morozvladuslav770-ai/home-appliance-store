import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, type FieldErrors } from "../../api";
import { useAdminData } from "../../admin/useAdminData";
import { useAuth } from "../../auth/context";
import Field from "../../components/Field";
import { formatPrice, STATUS_LABEL, type Product, type ProductStatus } from "../../data";
import { useShop } from "../../shop/context";

type Form = {
  name: string;
  brand: string;
  category: string;
  price: string;
  energy_class: string;
  status: ProductStatus;
  stock_quantity: string;
  image_url: string;
  description: string;
};

const toForm = (p: Product | null, category: string): Form => ({
  name: p?.name ?? "",
  brand: p?.brand ?? "",
  category: p?.category ?? category,
  price: p ? String(Number(p.price)) : "",
  energy_class: p?.energy_class ?? "",
  status: p?.status ?? "in_stock",
  stock_quantity: String(p?.stock_quantity ?? 0),
  image_url: p?.image_url ?? "",
  description: p?.description ?? "",
});

function ProductForm({
  product,
  onSaved,
  onCancel,
}: {
  product: Product | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { token } = useAuth();
  const { categories } = useShop();
  const [form, setForm] = useState<Form>(() => toForm(product, categories[0]?.name ?? ""));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    setErrors({});
    const result = await api(product ? `/admin/products/${product.id}` : "/admin/products", {
      method: product ? "PATCH" : "POST",
      token,
      body: { product: form },
    });
    setSending(false);

    if (result.ok) onSaved();
    else setErrors(result.errors);
  };

  return (
    <form className="panel" onSubmit={submit} noValidate aria-label={product ? "Редагування товару" : "Новий товар"}>
      <h2 className="account__title">{product ? `Редагування: ${product.name}` : "Новий товар"}</h2>
      {errors.base && (
        <ul className="form-errors" role="alert">
          {errors.base.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}

      <div className="form-grid">
        <Field label="Назва" error={errors.name}>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Бренд" error={errors.brand}>
          <input value={form.brand} onChange={(e) => set("brand", e.target.value)} />
        </Field>
        <Field label="Категорія" error={errors.category}>
          <select value={form.category} onChange={(e) => set("category", e.target.value)}>
            {categories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Ціна, грн" error={errors.price}>
          <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} />
        </Field>
        <Field label="Статус" error={errors.status}>
          <select value={form.status} onChange={(e) => set("status", e.target.value as ProductStatus)}>
            {(Object.keys(STATUS_LABEL) as ProductStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Кількість на складі" error={errors.stock_quantity}>
          <input
            type="number"
            min="0"
            step="1"
            value={form.stock_quantity}
            onChange={(e) => set("stock_quantity", e.target.value)}
          />
        </Field>
        <Field label="Енергоклас" error={errors.energy_class}>
          <select value={form.energy_class} onChange={(e) => set("energy_class", e.target.value)}>
            <option value="">Не вказано</option>
            {["A", "B", "C", "D", "E", "F", "G"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Посилання на фото" error={errors.image_url}>
          <input
            type="url"
            placeholder="https://…"
            value={form.image_url}
            onChange={(e) => set("image_url", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Опис" error={errors.description}>
        <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
      </Field>
      {!product && <p className="panel__hint">Артикул (SKU) буде створено автоматично.</p>}

      <div className="row-actions">
        <button type="submit" className="btn btn--primary" disabled={sending}>
          {sending ? "Зберігаємо…" : "Зберегти"}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Скасувати
        </button>
      </div>
    </form>
  );
}

export default function AdminProductsPage() {
  const { token } = useAuth();
  const { reload: reloadShop } = useShop();
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  const { data, error, reload } = useAdminData<Product[]>(`/admin/products?q=${encodeURIComponent(applied)}`);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  const open = (target: Product | "new") => {
    setEditing(target);
    setMessage("");
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const saved = () => {
    setEditing(null);
    setMessage("Збережено");
    reload();
    reloadShop();
  };

  const remove = async (p: Product) => {
    if (!window.confirm(`Видалити «${p.name}»?`)) return;
    const result = await api(`/admin/products/${p.id}`, { method: "DELETE", token });
    if (result.ok) {
      setMessage("Товар видалено");
      reload();
      reloadShop();
    } else {
      setMessage(result.errors.base?.[0] ?? "Не вдалося видалити товар");
    }
  };

  return (
    <div className="admin-block">
      <div className="toolbar">
        <form
          className="search search--inline"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setApplied(query);
          }}
        >
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук за назвою, брендом, категорією"
            aria-label="Пошук товарів"
          />
        </form>
        <button type="button" className="btn btn--primary" onClick={() => open("new")}>
          Додати товар
        </button>
      </div>

      {message && (
        <p className="alert-ok" role="status">
          {message}
        </p>
      )}
      {error && <p className="form-errors">{error}</p>}

      <div ref={formRef}>
        {editing && (
          <ProductForm
            key={editing === "new" ? "new" : editing.id}
            product={editing === "new" ? null : editing}
            onSaved={saved}
            onCancel={() => setEditing(null)}
          />
        )}
      </div>

      {data === null && !error && <p className="notice">Завантаження…</p>}
      {data && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Товар</th>
                <th scope="col">Категорія</th>
                <th scope="col" className="num">Ціна</th>
                <th scope="col" className="num">Склад</th>
                <th scope="col">Статус</th>
                <th scope="col">
                  <span className="sr-only">Дії</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/product/${p.id}`}>{p.name}</Link>
                    <small>
                      {p.brand} · {p.sku}
                    </small>
                  </td>
                  <td>{p.category}</td>
                  <td className="num">{formatPrice(p.price)}</td>
                  <td className="num">{p.stock_quantity}</td>
                  <td>
                    <span className={`status status--${p.status}`}>{STATUS_LABEL[p.status]}</span>
                  </td>
                  <td className="row-actions">
                    <button type="button" className="link" onClick={() => open(p)}>
                      Редагувати
                    </button>
                    <button type="button" className="link link--danger" onClick={() => remove(p)}>
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && <p className="empty">Товарів не знайдено.</p>}
        </div>
      )}
    </div>
  );
}
