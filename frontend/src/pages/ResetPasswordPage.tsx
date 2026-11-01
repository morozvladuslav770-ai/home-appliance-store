import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, type FieldErrors } from "../api";
import Field from "../components/Field";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <section className="section container auth">
        <h1 className="h2">Посилання не працює</h1>
        <p className="auth__hint">У посиланні немає ключа. Запросіть відновлення пароля ще раз.</p>
        <Link className="btn btn--primary" to="/forgot-password">
          Відновити пароль
        </Link>
      </section>
    );
  }

  if (done) {
    return (
      <section className="section container auth">
        <h1 className="h2">Пароль змінено</h1>
        <p className="alert-ok">Тепер можна увійти з новим паролем.</p>
        <Link className="btn btn--primary" to="/login">
          Увійти
        </Link>
      </section>
    );
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    setErrors({});
    const result = await api("/password_reset", {
      method: "PATCH",
      body: { token, password, password_confirmation: confirmation },
    });
    setSending(false);

    if (result.ok) setDone(true);
    else setErrors(result.errors);
  };

  return (
    <section className="section container auth" aria-labelledby="reset-title">
      <h1 className="h2" id="reset-title">
        Новий пароль
      </h1>

      <form className="panel" onSubmit={onSubmit} noValidate>
        {errors.base && (
          <div className="form-errors" role="alert">
            <p>{errors.base[0]}</p>
            <Link to="/forgot-password">Запросити нове посилання</Link>
          </div>
        )}
        <Field label="Новий пароль" error={errors.password}>
          <input
            type="password"
            value={password}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <p className="panel__hint">Щонайменше 8 символів, літери й цифри.</p>
        <Field label="Повторіть пароль" error={errors.password_confirmation}>
          <input
            type="password"
            value={confirmation}
            autoComplete="new-password"
            onChange={(e) => setConfirmation(e.target.value)}
          />
        </Field>
        <button type="submit" className="btn btn--primary btn--block" disabled={sending}>
          {sending ? "Зберігаємо…" : "Зберегти пароль"}
        </button>
      </form>
    </section>
  );
}
