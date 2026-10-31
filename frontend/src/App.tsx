import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { DEMO_PRODUCTS, type Product } from "./data";
import { applyFilters, EMPTY_FILTERS, type Filters } from "./filters";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import ProductSection from "./components/ProductSection";
import Catalog from "./components/Catalog";
import Footer from "./components/Footer";

const API_URL = "http://localhost:3000/api/products";

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [cart, setCart] = useState<Product[]>([]);

  useEffect(() => {
    fetch(API_URL)
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
        }
      })
      .catch(() => {
        setProducts(DEMO_PRODUCTS);
        setDemo(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(() => applyFilters(products, filters), [products, filters]);

  const hits = useMemo(
    () =>
      applyFilters(products, { ...EMPTY_FILTERS, availableOnly: true, sort: "popular" }).slice(0, 4),
    [products],
  );
  const newest = useMemo(
    () => applyFilters(products, { ...EMPTY_FILTERS, availableOnly: true, sort: "newest" }).slice(0, 4),
    [products],
  );

  const scrollToCatalog = () =>
    document.getElementById("all")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const selectCategory = (category: string | null) => {
    setFilters((f) => ({ ...f, category }));
    if (category) scrollToCatalog();
  };

  const addToCart = (product: Product) => setCart((prev) => [...prev, product]);

  return (
    <div id="top">
      <Header
        query={filters.query}
        onQuery={(query) => setFilters((f) => ({ ...f, query }))}
        onSearchSubmit={scrollToCatalog}
        activeCategory={filters.category}
        onCategory={selectCategory}
        cartCount={cart.length}
      />

      <main>
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
            <ProductSection id="hits" title="Хіти продажів" products={hits} onAdd={addToCart} />
            <ProductSection id="new" title="Нові надходження" products={newest} onAdd={addToCart} />
            <Catalog
              allProducts={products}
              shown={shown}
              filters={filters}
              onChange={setFilters}
              onAdd={addToCart}
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
