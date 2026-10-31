import type { CartItem } from "./shop/context";

export const API_BASE = "http://localhost:3000/api";

export type DeliveryMethod = "courier" | "carrier_branch" | "pickup";
export type PaymentMethod = "card_online" | "cash_on_delivery" | "installments";
export type OrderStatus =
  | "pending_payment"
  | "processing"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export const DELIVERY_LABEL: Record<DeliveryMethod, string> = {
  courier: "Кур'єр за адресою",
  carrier_branch: "Відділення служби доставки",
  pickup: "Самовивіз",
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  card_online: "Карткою онлайн",
  cash_on_delivery: "При отриманні",
  installments: "Оплата частинами",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Очікує оплати",
  processing: "В обробці",
  paid: "Оплачено",
  shipped: "Відправлено",
  delivered: "Доставлено",
  cancelled: "Скасовано",
};

export type OrderForm = {
  customer_name: string;
  email: string;
  phone: string;
  city: string;
  delivery_method: DeliveryMethod;
  address: string;
  payment_method: PaymentMethod;
  comment: string;
};

export const EMPTY_ORDER_FORM: OrderForm = {
  customer_name: "",
  email: "",
  phone: "",
  city: "",
  delivery_method: "courier",
  address: "",
  payment_method: "cash_on_delivery",
  comment: "",
};

export type OrderResponse = {
  id: number;
  status: OrderStatus;
  total: string;
  customer_name: string;
  email: string;
  city: string;
  address: string | null;
  delivery_method: DeliveryMethod;
  payment_method: PaymentMethod;
  created_at: string;
  items: {
    product_id: number;
    name: string;
    sku: string | null;
    unit_price: string;
    quantity: number;
  }[];
};

export type FieldErrors = Record<string, string[]>;

export type SubmitResult =
  | { ok: true; order: OrderResponse }
  | { ok: false; errors: FieldErrors };

export async function submitOrder(form: OrderForm, items: CartItem[]): Promise<SubmitResult> {
  try {
    const response = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: form,
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.qty })),
      }),
    });
    const data = await response.json();

    if (response.ok) return { ok: true, order: data as OrderResponse };
    return {
      ok: false,
      errors: (data.errors as FieldErrors | undefined) ?? {
        base: ["Не вдалося оформити замовлення. Спробуйте ще раз."],
      },
    };
  } catch {
    return {
      ok: false,
      errors: { base: ["Не вдалося зв'язатися із сервером. Перевірте з'єднання й спробуйте ще раз."] },
    };
  }
}
