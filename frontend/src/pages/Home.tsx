import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { applyFilters, EMPTY_FILTERS } from "../filters";
import { useShop } from "../shop/context";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import ProductSection from "../components/ProductSection";
import Catalog from "../components/Catalog";

const scrollToId = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

export default function Home() {
  const { products, loading, demo, filters, setFilters } = useShop();
  const { key, state } = useLocation();
  const scrollTarget = (state as { scroll?: string } | null)?.scroll;

  // Перехід із шапки або з іншої сторінки: прокрутити до потрібного блоку
  useEffect(() => {
    if (!loading && scrollTarget) scrollToId(scrollTarget);
  }, [key, loading, scrollTarget]);

  const shown = useMemo(() => applyFilters(products, filters), [products, filters]);
  const hits = useMemo(
    () => applyFilters(products, { ...EMPTY_FILTERS, availableOnly: true, sort: "popular" }).slice(0, 4),
    [products],
  );
  const newest = useMemo(
    () => applyFilters(products, { ...EMPTY_FILTERS, availableOnly: true, sort: "newest" }).slice(0, 4),
    [products],
  );

  const selectCategory = (category: string | null) => {
    setFilters((f) => ({ ...f, category }));
    if (category) scrollToId("all");
  };

  return (
    <>
      <Hero />
      <Categories active={filters.category} onSelect={selectCategory} />

      {demo && !loading && (
        <p className="notice container" role="status">
          Сервер не віддав товари, тому показано демонстраційний каталог.
          Запустіть Rails API на порту 3000 і виконайте <code>bin/rails db:seed</code>.
        </p>
      )}

      {loading && <p className="notice container">Завантаження товарів…</p>}

      {!loading && (
        <>
          <ProductSection id="hits" title="Хіти продажів" products={hits} />
          <ProductSection id="new" title="Нові надходження" products={newest} />
          <Catalog allProducts={products} shown={shown} filters={filters} onChange={setFilters} />
        </>
      )}
    </>
  );
}
