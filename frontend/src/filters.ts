import type { Product } from "./data";

export type SortKey = "popular" | "price_asc" | "price_desc" | "rating" | "newest";

export type Filters = {
  category: string | null;
  query: string;
  brands: string[];
  energy: string[];
  minPrice: string;
  maxPrice: string;
  availableOnly: boolean;
  minRating: number;
  sort: SortKey;
};

export const EMPTY_FILTERS: Filters = {
  category: null,
  query: "",
  brands: [],
  energy: [],
  minPrice: "",
  maxPrice: "",
  availableOnly: false,
  minRating: 0,
  sort: "popular",
};

export const SORT_LABEL: Record<SortKey, string> = {
  popular: "За популярністю",
  price_asc: "Від дешевших",
  price_desc: "Від дорожчих",
  rating: "За рейтингом",
  newest: "Спочатку нові",
};

// Лічильник активних фільтрів (без сортування) — для кнопки «Скинути»
export function activeCount(f: Filters): number {
  return (
    (f.category ? 1 : 0) +
    (f.query.trim() ? 1 : 0) +
    f.brands.length +
    f.energy.length +
    (f.minPrice ? 1 : 0) +
    (f.maxPrice ? 1 : 0) +
    (f.availableOnly ? 1 : 0) +
    (f.minRating > 0 ? 1 : 0)
  );
}

const num = (v: string | null) => (v === null ? 0 : Number(v));

// Та сама логіка, що й у GET /api/products (backend/app/models/product.rb)
export function applyFilters(products: Product[], f: Filters): Product[] {
  const q = f.query.trim().toLowerCase();
  const min = f.minPrice ? Number(f.minPrice) : null;
  const max = f.maxPrice ? Number(f.maxPrice) : null;

  const list = products.filter(
    (p) =>
      (f.category === null || p.category === f.category) &&
      (q === "" ||
        [p.name, p.brand ?? "", p.category].some((t) => t.toLowerCase().includes(q))) &&
      (f.brands.length === 0 || (p.brand !== null && f.brands.includes(p.brand))) &&
      (f.energy.length === 0 || (p.energy_class !== null && f.energy.includes(p.energy_class))) &&
      (min === null || Number(p.price) >= min) &&
      (max === null || Number(p.price) <= max) &&
      (!f.availableOnly || p.status !== "discontinued") &&
      (f.minRating === 0 || num(p.rating) >= f.minRating),
  );

  return list.sort((a, b) => {
    switch (f.sort) {
      case "price_asc":
        return Number(a.price) - Number(b.price);
      case "price_desc":
        return Number(b.price) - Number(a.price);
      case "rating":
        return num(b.rating) - num(a.rating) || b.id - a.id;
      case "newest":
        return b.id - a.id;
      default:
        return num(b.rating) - num(a.rating) || a.stock_quantity - b.stock_quantity || b.id - a.id;
    }
  });
}
