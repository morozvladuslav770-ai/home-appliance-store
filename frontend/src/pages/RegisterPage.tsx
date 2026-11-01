import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { api, type FieldErrors } from "../api";
import { useAuth } from "../auth/context";
import Field from "../components/Field";

const EMPTY = { full_name: "", email: "", phone: "", password: "", password_confirmation: "" };

export default function RegisterPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);
  const [doneEmail, setDoneEmail] = useState<string | null>(null);

  if (user) return <Navigate to="/" replace />;

  if (doneEmail) {
    return (
      <section className="section container auth">
        <h1 className="h2">Перевірте пошту</h1>
        <p className="alert-ok" role="status">
          Ми надіслали лист на {doneEmail}. Перейдіть за посиланням у ньому, щоб підтвердити email.
          До підтвердження увійти в акаунт не можна.
        </p>
        <Link className="btn btn--primary" to="/login">
          До входу
        </Link>
      </section>
    );
  }

  const set = (key: keyof typeof EMPTY, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    setErrors({});
    const result = await api("/registration", { method: "POST", body: { user: form } });
    setSending(false);

    if (result.ok) setDoneEmail(form.email.trim());
    else setErrors(result.errors);
  };

  return (
    <section className="section container auth" aria-labelledby="register-title">
      <h1 className="h2" id="register-title">
        Реєстрація
      </h1>

      <form className="panel" onSubmit={onSubmit} noValidate>
        {errors.base && (
          <ul className="form-errors" role="alert">
            {errors.base.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
        <Field label="Ім'я та прізвище" error={errors.full_name}>
          <input
            value={form.full_name}
            autoComplete="name"
            onChange={(e) => set("full_name", e.target.value)}
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <input
            type="email"
            value={form.email}
            autoComplete="email"
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>
        <Field label="Телефон" error={errors.phone}>
          <input
            type="tel"
            value={form.phone}
            placeholder="+380"
            autoComplete="tel"
            onChange={(e) => set("phone", e.target.value)}
          />
        </Field>
        <Field label="Пароль" error={errors.password}>
          <input
            type="password"
            value={form.password}
            autoComplete="new-password"
            onChange={(e) => set("password", e.target.value)}
          />
        </Field>
        <p className="panel__hint">Щонайменше 8 символів, літери й цифри.</p>
        <Field label="Повторіть пароль" error={errors.password_confirmation}>
          <input
            type="password"
            value={form.password_confirmation}
            autoComplete="new-password"
            onChange={(e) => set("password_confirmation", e.target.value)}
          />
        </Field>

        <button type="submit" className="btn btn--primary btn--block" disabled={sending}>
          {sending ? "Реєструємо…" : "Зареєструватися"}
        </button>
      </form>

      <p className="auth__links">
        <span>
          Уже є акаунт? <Link to="/login">Увійти</Link>
        </span>
      </p>
    </section>
  );
}
