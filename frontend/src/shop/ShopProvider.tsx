import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { API_BASE } from "../api";
import { CATEGORIES, DEMO_PRODUCTS, kindOf, type CategoryItem, type Product } from "../data";
import { EMPTY_FILTERS, type Filters } from "../filters";
import { loadCart, maxQty, saveCart } from "./cart";
import { CartContext, ShopContext, type CartItem, type CartState, type ShopState } from "./context";

export default function ShopProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryItem[]>(CATEGORIES);
  const [demo, setDemo] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [stored, setStored] = useState<CartItem[]>(loadCart);

  const load = useCallback(() => {
    fetch(`${API_BASE}/products`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Не вдалося завантажити товари");
        }
        return response.json();
      })
      .then((data: Product[]) => {
        if (data.length === 0) {
          setProducts(DEMO_PRODUCTS);
          setDemo(true);
        } else {
          setProducts(data);
          setDemo(false);
        }
      })
      .catch(() => {
        setProducts(DEMO_PRODUCTS);
        setDemo(true);
      })
      .finally(() => setLoading(false));

    // Категорії керуються в адмін-панелі; якщо сервер не відповів, лишається запасний список
    fetch(`${API_BASE}/categories`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { name: string }[]) => {
        if (data.length > 0) {
          setCategories(data.map((c) => ({ name: c.name, kind: kindOf(c.name) })));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    saveCart(stored);
  }, [stored]);

  const shop = useMemo<ShopState>(
    () => ({ products, categories, loading, demo, filters, setFilters, reload: load }),
    [products, categories, loading, demo, filters, load],
  );

  // Актуальні ціни й статуси підтягуються з каталогу, у сховищі лишається знімок
  const items = useMemo<CartItem[]>(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return stored.map((i) => ({ product: byId.get(i.product.id) ?? i.product, qty: i.qty }));
  }, [stored, products]);

  const cart = useMemo<CartState>(
    () => ({
      items,
      count: items.reduce((sum, i) => sum + i.qty, 0),
      total: items.reduce((sum, i) => sum + Number(i.product.price) * i.qty, 0),
      add: (product, qty = 1) => {
        const max = maxQty(product);
        if (max === 0) return;
        setStored((prev) => {
          const existing = prev.find((i) => i.product.id === product.id);
          if (!existing) return [...prev, { product, qty: Math.min(qty, max) }];
          return prev.map((i) =>
            i.product.id === product.id
              ? { product, qty: Math.min(i.qty + qty, max) }
              : i,
          );
        });
      },
      setQty: (productId, qty) => {
        const item = items.find((i) => i.product.id === productId);
        if (!item) return;
        const next = Math.min(qty, maxQty(item.product));
        setStored((prev) =>
          next <= 0
            ? prev.filter((i) => i.product.id !== productId)
            : prev.map((i) => (i.product.id === productId ? { ...i, qty: next } : i)),
        );
      },
      remove: (productId) =>
        setStored((prev) => prev.filter((i) => i.product.id !== productId)),
      clear: () => setStored([]),
    }),
    [items],
  );

  return (
    <ShopContext.Provider value={shop}>
      <CartContext.Provider value={cart}>{children}</CartContext.Provider>
    </ShopContext.Provider>
  );
}
