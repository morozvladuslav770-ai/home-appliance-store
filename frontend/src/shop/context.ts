import { createContext, useContext, type Dispatch, type SetStateAction } from "react";
import type { Product } from "../data";
import type { Filters } from "../filters";

export type CartItem = { product: Product; qty: number };

export type ShopState = {
  products: Product[];
  loading: boolean;
  demo: boolean;
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
};

export type CartState = {
  items: CartItem[];
  count: number;
  total: number;
  add: (product: Product, qty?: number) => void;
  setQty: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

export const ShopContext = createContext<ShopState | null>(null);
export const CartContext = createContext<CartState | null>(null);

export function useShop(): ShopState {
  const value = useContext(ShopContext);
  if (!value) throw new Error("useShop потрібно викликати всередині ShopProvider");
  return value;
}

export function useCart(): CartState {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart потрібно викликати всередині ShopProvider");
  return value;
}
