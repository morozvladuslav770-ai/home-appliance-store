import type { Product } from "../data";
import ProductCard from "./ProductCard";

type Props = {
  id: string;
  title: string;
  products: Product[];
};

export default function ProductSection({ id, title, products }: Props) {
  return (
    <section className="section container" id={id} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>{title}</h2>
      <div className="products">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
