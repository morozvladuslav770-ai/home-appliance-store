import type { Product } from "../data";
import type { CartItem } from "./context";

const STORAGE_KEY = "technodim-cart";

// Скільки одиниць товару можна покласти в кошик
export function maxQty(product: Product): number {
  if (product.status === "discontinued") return 0;
  if (product.status === "on_order") return 10;
  return Math.max(1, Math.min(product.stock_quantity, 99));
}

export function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is CartItem =>
        typeof i === "object" &&
        i !== null &&
        typeof i.product?.id === "number" &&
        typeof i.qty === "number" &&
        i.qty > 0,
    );
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // приватний режим або переповнене сховище — кошик просто не збережеться
  }
}
