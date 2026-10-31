export type ProductStatus = "in_stock" | "on_order" | "discontinued";

export type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  description: string | null;
  brand: string | null;
  energy_class: string | null;
  status: ProductStatus;
  sku: string | null;
  stock_quantity: number;
  rating: string | null;
  image_url: string | null;
};

export type ApplianceKind =
  | "fridge"
  | "washer"
  | "cooker"
  | "dishwasher"
  | "hood"
  | "oven"
  | "freezer";

// Категорії з розділу 3.3 СРС (FR-3.1)
export const CATEGORIES: { name: string; kind: ApplianceKind }[] = [
  { name: "Холодильники", kind: "fridge" },
  { name: "Пральні машини", kind: "washer" },
  { name: "Плити", kind: "cooker" },
  { name: "Посудомийні машини", kind: "dishwasher" },
  { name: "Витяжки", kind: "hood" },
  { name: "Духові шафи", kind: "oven" },
  { name: "Морозильні камери", kind: "freezer" },
];

export function kindOf(category: string): ApplianceKind {
  return CATEGORIES.find((c) => c.name === category)?.kind ?? "fridge";
}

// Демонстраційні товари — показуються, поки API недоступне або порожнє.
// Дзеркало backend/db/seeds.rb.
const demo = (
  id: number,
  name: string,
  category: string,
  brand: string,
  energy_class: string | null,
  price: number,
  rating: number,
  stock_quantity: number,
  description: string,
): Product => ({
  id,
  name,
  category,
  brand,
  energy_class,
  price: price.toFixed(2),
  rating: rating.toFixed(1),
  stock_quantity,
  description,
  status: stock_quantity === 0 ? "on_order" : "in_stock",
  sku: `TD-DEMO${String(id).padStart(2, "0")}`,
  image_url: null,
});

export const DEMO_PRODUCTS: Product[] = [
  demo(1, "Холодильник двокамерний, 185 см", "Холодильники", "Samsung", "A", 28999, 4.7, 12, "No Frost, об'єм 360 л, інверторний компресор."),
  demo(2, "Холодильник Side-by-Side, 177 см", "Холодильники", "LG", "A", 42999, 4.8, 5, "Дві двері, диспенсер води, об'єм 560 л."),
  demo(3, "Холодильник з нижньою морозилкою", "Холодильники", "Bosch", "B", 24499, 4.5, 8, "Об'єм 320 л, зона свіжості, тихий компресор."),
  demo(4, "Пральна машина 8 кг, фронтальна", "Пральні машини", "Bosch", "B", 17499, 4.6, 20, "1400 об/хв, 15 програм, захист від протікання."),
  demo(5, "Пральна машина 7 кг з сушінням", "Пральні машини", "Samsung", "A", 21999, 4.4, 7, "Інвертор, паровий режим, сушіння 4 кг."),
  demo(6, "Пральна машина вузька, 6 кг", "Пральні машини", "Candy", "C", 11299, 4.1, 15, "Глибина 40 см, 1000 об/хв, 16 програм."),
  demo(7, "Плита комбінована, 60 см", "Плити", "Gorenje", "A", 14299, 4.3, 9, "4 конфорки, електрична духовка 65 л, гриль."),
  demo(8, "Плита індукційна, 60 см", "Плити", "Electrolux", "A", 19799, 4.6, 4, "Індукційна панель, духовка 72 л, конвекція."),
  demo(9, "Посудомийна машина, 45 см", "Посудомийні машини", "Bosch", "A", 15999, 4.7, 11, "10 комплектів посуду, 6 програм, напівзавантаження."),
  demo(10, "Посудомийна машина, 60 см", "Посудомийні машини", "Beko", "B", 13799, 4.2, 0, "13 комплектів посуду, швидка програма 30 хв."),
  demo(11, "Витяжка похила, 60 см", "Витяжки", "Pyramida", null, 6799, 4.0, 14, "Продуктивність 600 м³/год, сенсорне керування."),
  demo(12, "Духова шафа електрична, 70 л", "Духові шафи", "Electrolux", "A", 12899, 4.5, 6, "Конвекція, 9 режимів, телескопічні напрямні."),
  demo(13, "Морозильна камера, 5 шухляд", "Морозильні камери", "Liebherr", "B", 19499, 4.8, 3, "Об'єм 240 л, швидке заморожування, No Frost."),
];

export const formatPrice = (value: string) =>
  `${Number(value).toLocaleString("uk-UA")} грн`;

export const STATUS_LABEL: Record<ProductStatus, string> = {
  in_stock: "В наявності",
  on_order: "Під замовлення",
  discontinued: "Знято з продажу",
};
