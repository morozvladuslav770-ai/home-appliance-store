import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/context";
import Field from "../components/Field";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const from = (state as { from?: string } | null)?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    setError(null);
    setNotice("");
    const result = await login(email, password, remember);
    setSending(false);

    if (result.ok) navigate(from, { replace: true });
    else setError({ message: result.message, code: result.code });
  };

  const resend = async () => {
    await api("/confirmation/resend", { method: "POST", body: { email } });
    setNotice("Якщо акаунт існує, ми надіслали новий лист із посиланням.");
  };

  return (
    <section className="section container auth" aria-labelledby="login-title">
      <h1 className="h2" id="login-title">
        Вхід
      </h1>
      {from === "/checkout" && (
        <p className="auth__hint">Увійдіть, щоб оформити замовлення. Кошик збережеться.</p>
      )}

      <form className="panel" onSubmit={onSubmit} noValidate>
        {error && (
          <div className="form-errors" role="alert">
            <p>{error.message}</p>
            {error.code === "unconfirmed" && (
              <button type="button" className="link" onClick={resend}>
                Надіслати лист ще раз
              </button>
            )}
          </div>
        )}
        {notice && (
          <p className="alert-ok" role="status">
            {notice}
          </p>
        )}

        <Field label="Email">
          <input
            type="email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Пароль">
          <input
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <label className="check">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Запам'ятати мене
        </label>

        <button type="submit" className="btn btn--primary btn--block" disabled={sending}>
          {sending ? "Входимо…" : "Увійти"}
        </button>
      </form>

      <p className="auth__links">
        <Link to="/forgot-password">Забули пароль?</Link>
        <span>
          Немає акаунта? <Link to="/register">Зареєструватися</Link>
        </span>
      </p>
    </section>
  );
}
