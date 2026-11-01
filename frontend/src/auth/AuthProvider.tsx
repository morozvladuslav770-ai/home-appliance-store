import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../api";
import { AuthContext, type AuthState, type LoginResult, type User } from "./context";
import { clearToken, loadToken, saveToken } from "./storage";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(loadToken);
  const [user, setUser] = useState<User | null>(null);
  // поки відновлюємо сесію за збереженим токеном, сторінки не вирішують, чи пускати користувача
  const [loading, setLoading] = useState(() => loadToken() !== null);

  useEffect(() => {
    if (!token || user) return;
    let cancelled = false;

    api<{ user: User }>("/session", { token }).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setUser(result.data.user);
      } else if (result.status === 401) {
        // токен прострочений або недійсний (наприклад, змінився пароль)
        clearToken();
        setToken(null);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [token, user]);

  const login = useCallback(
    async (email: string, password: string, remember: boolean): Promise<LoginResult> => {
      const result = await api<{ token: string; user: User }>("/session", {
        method: "POST",
        body: { email, password, remember },
      });

      if (!result.ok) {
        return { ok: false, message: result.errors.base?.[0] ?? "Не вдалося увійти", code: result.code };
      }
      saveToken(result.data.token, remember);
      setToken(result.data.token);
      setUser(result.data.user);
      setLoading(false);
      return { ok: true };
    },
    [],
  );

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, token, loading, login, logout }),
    [user, token, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
