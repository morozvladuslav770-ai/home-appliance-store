import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";

type State = "loading" | "ok" | "failed";

export default function ConfirmEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>(token ? "loading" : "failed");
  const [email, setEmail] = useState("");
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api("/confirmation", { method: "POST", body: { token } }).then((result) => {
      if (!cancelled) setState(result.ok ? "ok" : "failed");
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const resend = async () => {
    await api("/confirmation/resend", { method: "POST", body: { email } });
    setResent(true);
  };

  return (
    <section className="section container auth" aria-live="polite">
      {state === "loading" && <p className="notice">Підтверджуємо email…</p>}

      {state === "ok" && (
        <>
          <h1 className="h2">Email підтверджено</h1>
          <p className="alert-ok">Акаунт активовано, тепер можна увійти.</p>
          <Link className="btn btn--primary" to="/login">
            Увійти
          </Link>
        </>
      )}

      {state === "failed" && (
        <>
          <h1 className="h2">Посилання не працює</h1>
          <p className="auth__hint">
            Воно недійсне або застаріло (дійсне 2 дні). Вкажіть email, і ми надішлемо новий лист.
          </p>
          <div className="panel">
            <label className="field">
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <button type="button" className="btn btn--primary" onClick={resend} disabled={!email}>
              Надіслати лист
            </button>
            {resent && (
              <p className="alert-ok" role="status">
                Якщо акаунт існує й ще не підтверджений, лист уже в дорозі.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
