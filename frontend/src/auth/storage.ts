const KEY = "technodim-token";

// «Запам'ятати мене» (FR-2.5): localStorage переживає закриття браузера, sessionStorage — ні
export function loadToken(): string | null {
  try {
    return localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveToken(token: string, remember: boolean) {
  try {
    clearToken();
    (remember ? localStorage : sessionStorage).setItem(KEY, token);
  } catch {
    // сховище недоступне — користувач залишиться увійденим до перезавантаження
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
  } catch {
    // нічого видаляти
  }
}
