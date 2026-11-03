import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useShop, useWishlist } from "../shop/context";

export default function WishlistPage() {
  const { products, loading } = useShop();
  const { ids } = useWishlist();

  if (loading) return <p className="notice container">Завантаження…</p>;

  // порядок — від нових до старих; товари, яких уже немає в каталозі, пропускаємо
  const byId = new Map(products.map((p) => [p.id, p]));
  const saved = ids.flatMap((id) => byId.get(id) ?? []);

  return (
    <section className="section container" aria-labelledby="wishlist-title">
      <h1 className="h2" id="wishlist-title">
        Бажане
      </h1>

      {saved.length === 0 ? (
        <div className="page-message">
          <p>У списку поки порожньо. Натискайте сердечко на картках товарів, щоб зберегти їх тут.</p>
          <Link className="btn btn--primary" to="/">
            До каталогу
          </Link>
        </div>
      ) : (
        <div className="products">
          {saved.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
