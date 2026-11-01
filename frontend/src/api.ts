export const API_BASE = "http://localhost:3000/api";

export type FieldErrors = Record<string, string[]>;

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; errors: FieldErrors; code?: string };

type Options = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
};

const FALLBACK: Record<number, string> = {
  0: "Не вдалося зв'язатися із сервером. Перевірте з'єднання й спробуйте ще раз.",
  429: "Забагато запитів. Спробуйте ще раз за хвилину.",
};

export async function api<T = unknown>(
  path: string,
  { method = "GET", body, token }: Options = {},
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (response.ok) return { ok: true, status: response.status, data: data as T };
    return {
      ok: false,
      status: response.status,
      errors: (data?.errors as FieldErrors | undefined) ?? {
        base: [FALLBACK[response.status] ?? "Щось пішло не так. Спробуйте ще раз."],
      },
      code: data?.code as string | undefined,
    };
  } catch {
    return { ok: false, status: 0, errors: { base: [FALLBACK[0]] } };
  }
}
