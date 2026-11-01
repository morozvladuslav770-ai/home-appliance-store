import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import Field from "../components/Field";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    await api("/password_reset", { method: "POST", body: { email } });
    setSending(false);
    setSent(true);
  };

  return (
    <section className="section container auth" aria-labelledby="forgot-title">
      <h1 className="h2" id="forgot-title">
        Відновлення пароля
      </h1>

      {sent ? (
        <p className="alert-ok" role="status">
          Якщо така адреса зареєстрована, ми надіслали лист із посиланням. Воно діє 30 хвилин.
        </p>
      ) : (
        <form className="panel" onSubmit={onSubmit}>
          <p className="panel__hint">Вкажіть email акаунта, і ми надішлемо посилання для нового пароля.</p>
          <Field label="Email">
            <input
              type="email"
              required
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <button type="submit" className="btn btn--primary btn--block" disabled={sending}>
            {sending ? "Надсилаємо…" : "Надіслати посилання"}
          </button>
        </form>
      )}

      <p className="auth__links">
        <Link to="/login">Назад до входу</Link>
      </p>
    </section>
  );
}
