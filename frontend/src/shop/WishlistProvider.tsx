import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../api";
import { useAuth } from "../auth/context";
import { WishlistContext, type WishlistState } from "./context";

type Stored = { userId: number; ids: number[] };

// Список бажаного живе на сервері й прив'язаний до користувача; без входу він порожній
export default function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [stored, setStored] = useState<Stored | null>(null);

  useEffect(() => {
    if (!user || !token) return;
    let cancelled = false;

    api<{ product_ids: number[] }>("/wishlist", { token }).then((result) => {
      if (!cancelled && result.ok) setStored({ userId: user.id, ids: result.data.product_ids });
    });
    return () => {
      cancelled = true;
    };
  }, [user, token]);

  // дані іншого користувача (після виходу й нового входу) не показуємо
  const ids = useMemo(() => (user && stored?.userId === user.id ? stored.ids : []), [user, stored]);

  const toggle = useCallback(
    async (productId: number) => {
      if (!user || !token) return false;

      const wasIn = ids.includes(productId);
      // оновлюємо одразу, а якщо сервер відмовив — повертаємо як було
      setStored({ userId: user.id, ids: wasIn ? ids.filter((id) => id !== productId) : [productId, ...ids] });

      const result = wasIn
        ? await api<{ product_ids: number[] }>(`/wishlist/${productId}`, { method: "DELETE", token })
        : await api<{ product_ids: number[] }>("/wishlist", { method: "POST", token, body: { product_id: productId } });

      setStored({ userId: user.id, ids: result.ok ? result.data.product_ids : ids });
      return result.ok;
    },
    [user, token, ids],
  );

  const value = useMemo<WishlistState>(
    () => ({ ids, has: (id) => ids.includes(id), toggle }),
    [ids, toggle],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
