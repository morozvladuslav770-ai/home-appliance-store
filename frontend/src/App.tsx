import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { DEMO_PRODUCTS, type Product } from "./data";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import ProductSection from "./components/ProductSection";
import Footer from "./components/Footer";

const API_URL = "http://localhost:3000/api/products";

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
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

  const filtering = category !== null || query.trim() !== "";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === null || p.category === category) &&
        (q === "" ||
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)),
    );
  }, [products, query, category]);

  const hits = products.slice(0, 4);
  const newest = [...products].sort((a, b) => b.id - a.id).slice(0, 4);

  const reset = () => {
    setCategory(null);
    setQuery("");
  };

  const addToCart = (product: Product) => setCart((prev) => [...prev, product]);

  return (
    <div id="top">
      <Header
        query={query}
        onQuery={setQuery}
        activeCategory={category}
        onCategory={setCategory}
        cartCount={cart.length}
      />

      <main>
        <Hero />
        <Categories active={category} onSelect={setCategory} />

        {demo && !loading && (
          <p className="notice container" role="status">
            Сервер не віддав товари, тому показано демонстраційний каталог.
            Запустіть Rails API на порту 3000, щоб побачити реальні дані.
          </p>
        )}

        {loading && <p className="notice container">Завантаження товарів…</p>}

        {!loading && filtering && (
          <ProductSection
            id="results"
            title={category ?? "Результати пошуку"}
            products={filtered}
            onAdd={addToCart}
            emptyText="Нічого не знайдено. Змініть запит або скиньте фільтр."
            action={{ label: "Скинути фільтри", onClick: reset }}
          />
        )}

        {!loading && !filtering && (
          <>
            <ProductSection id="hits" title="Хіти продажів" products={hits} onAdd={addToCart} />
            <ProductSection id="new" title="Нові надходження" products={newest} onAdd={addToCart} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
