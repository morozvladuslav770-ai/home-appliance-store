import { ROLE_LABEL, type Role } from "../auth/context";
import { STATUS_LABEL, type ProductStatus } from "../data";
import { ORDER_STATUS_LABEL, type OrderStatus } from "../orders";

export const ACTION_LABEL: Record<string, string> = {
  "product.create": "Створено товар",
  "product.update": "Змінено товар",
  "product.destroy": "Видалено товар",
  "category.create": "Створено категорію",
  "category.update": "Перейменовано категорію",
  "category.destroy": "Видалено категорію",
  "order.status": "Змінено статус замовлення",
  "user.role": "Змінено роль користувача",
};

const FIELD_LABEL: Record<string, string> = {
  name: "Назва",
  brand: "Бренд",
  category: "Категорія",
  price: "Ціна",
  description: "Опис",
  energy_class: "Енергоклас",
  status: "Статус",
  stock_quantity: "Склад",
  image_url: "Фото",
  rating: "Рейтинг",
  sku: "Артикул",
};

function show(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (field === "status") return STATUS_LABEL[value as ProductStatus] ?? String(value);
  if (field === "price") return `${Number(value).toLocaleString("uk-UA")} грн`;
  return String(value);
}

// Короткий опис змін для рядка журналу
export function describeDetails(action: string, details: Record<string, unknown>): string {
  if (action === "product.update") {
    const changes = (details.changes ?? {}) as Record<string, [unknown, unknown]>;
    return Object.entries(changes)
      .map(([field, [from, to]]) => `${FIELD_LABEL[field] ?? field}: ${show(field, from)} → ${show(field, to)}`)
      .join("; ");
  }
  if (action === "category.update") {
    const [from, to] = (details.name ?? []) as string[];
    return `${from} → ${to}`;
  }
  if (action === "order.status") {
    const [from, to] = (details.status ?? []) as OrderStatus[];
    return `${ORDER_STATUS_LABEL[from] ?? from} → ${ORDER_STATUS_LABEL[to] ?? to}`;
  }
  if (action === "user.role") {
    const [from, to] = (details.role ?? []) as Role[];
    return `${ROLE_LABEL[from] ?? from} → ${ROLE_LABEL[to] ?? to}`;
  }
  const parts: string[] = [];
  if (details.sku) parts.push(`Артикул: ${details.sku}`);
  if (details.price) parts.push(`Ціна: ${show("price", details.price)}`);
  return parts.join("; ");
}
