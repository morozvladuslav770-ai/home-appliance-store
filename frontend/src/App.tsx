
import { useEffect, useState } from "react";
import "./App.css";

type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  description: string;
};

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Не вдалося завантажити товари");
        }

        return response.json();
      })
      .then((data: Product[]) => {
        setProducts(data);
      })
      .catch(() => {
        setError("Не вдалося підключитися до сервера.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main>
      <header className="header">
        <h1>ТехноДім</h1>
        <p>Велика техніка для твого дому</p>
      </header>

      <section className="catalog">
        <h2>Каталог товарів</h2>

        {loading && <p>Завантаження товарів...</p>}
        {error && <p>{error}</p>}

        <div className="products">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <span className="category">{product.category}</span>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <strong>
                {Number(product.price).toLocaleString("uk-UA")} грн
              </strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
