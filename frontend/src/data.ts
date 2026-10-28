export type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  description: string;
  energy_class?: string;
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

// Демонстраційні товари — показуються, поки API порожнє або недоступне
export const DEMO_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Холодильник двокамерний, 185 см",
    category: "Холодильники",
    price: "28999.00",
    description: "No Frost, об'єм 360 л, інверторний компресор.",
    energy_class: "A",
  },
  {
    id: 2,
    name: "Пральна машина 8 кг, фронтальна",
    category: "Пральні машини",
    price: "17499.00",
    description: "1400 об/хв, 15 програм, захист від протікання.",
    energy_class: "B",
  },
  {
    id: 3,
    name: "Плита комбінована, 60 см",
    category: "Плити",
    price: "14299.00",
    description: "4 конфорки, електрична духовка 65 л, гриль.",
    energy_class: "A",
  },
  {
    id: 4,
    name: "Посудомийна машина, 45 см",
    category: "Посудомийні машини",
    price: "15999.00",
    description: "10 комплектів посуду, 6 програм, режим напівзавантаження.",
    energy_class: "A",
  },
  {
    id: 5,
    name: "Витяжка похила, 60 см",
    category: "Витяжки",
    price: "6799.00",
    description: "Продуктивність 600 м³/год, сенсорне керування.",
  },
  {
    id: 6,
    name: "Духова шафа електрична, 70 л",
    category: "Духові шафи",
    price: "12899.00",
    description: "Конвекція, 9 режимів, телескопічні напрямні.",
    energy_class: "A",
  },
  {
    id: 7,
    name: "Морозильна камера, 5 шухляд",
    category: "Морозильні камери",
    price: "19499.00",
    description: "Об'єм 240 л, швидке заморожування, No Frost.",
    energy_class: "B",
  },
  {
    id: 8,
    name: "Холодильник Side-by-Side, 177 см",
    category: "Холодильники",
    price: "42999.00",
    description: "Дві двері, диспенсер води, об'єм 560 л.",
    energy_class: "A",
  },
];

export const formatPrice = (value: string) =>
  `${Number(value).toLocaleString("uk-UA")} грн`;
