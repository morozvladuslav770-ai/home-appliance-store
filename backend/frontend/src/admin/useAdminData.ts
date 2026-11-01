import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth/context";

// Завантажує список з адмін-API; reload() оновлює його після змін
export function useAdminData<T>(path: string) {
  const { token } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api<T>(path, { token }).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setData(result.data);
        setError("");
      } else {
        setError(result.errors.base?.[0] ?? "Не вдалося завантажити дані");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [path, token, version]);

  return { data, error, reload: () => setVersion((v) => v + 1) };
}
