import { createContext, useContext, type Dispatch, type SetStateAction } from "react";
import type { CategoryItem, Product } from "../data";
import type { Filters } from "../filters";

export type CartItem = { product: Product; qty: number };

export type ShopState = {
  products: Product[];
  categories: CategoryItem[];
  loading: boolean;
  demo: boolean;
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  /** Перезавантажити товари й категорії (після змін в адмін-панелі) */
  reload: () => void;
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

/** FR-4.3: у списку порівняння може бути до 4 товарів */
export const MAX_COMPARE = 4;

export type CompareState = {
  /** Товари зі списку порівняння (ті, що ще є в каталозі) */
  products: Product[];
  has: (productId: number) => boolean;
  full: boolean;
  toggle: (productId: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

/** FR-4.4: список бажаного зареєстрованого користувача */
export type WishlistState = {
  ids: number[];
  has: (productId: number) => boolean;
  /** Повертає false, якщо не вдалося зберегти (або користувач не увійшов) */
  toggle: (productId: number) => Promise<boolean>;
};

export const ShopContext = createContext<ShopState | null>(null);
export const CompareContext = createContext<CompareState | null>(null);
export const WishlistContext = createContext<WishlistState | null>(null);
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

export function useCompare(): CompareState {
  const value = useContext(CompareContext);
  if (!value) throw new Error("useCompare потрібно викликати всередині ShopProvider");
  return value;
}

export function useWishlist(): WishlistState {
  const value = useContext(WishlistContext);
  if (!value) throw new Error("useWishlist потрібно викликати всередині WishlistProvider");
  return value;
}
