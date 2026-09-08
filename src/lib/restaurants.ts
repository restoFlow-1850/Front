import resto1 from "@/assets/resto-1.jpg";
import resto2 from "@/assets/resto-2.jpg";
import resto3 from "@/assets/resto-3.jpg";
import type { Product, Table } from "./api";
import { FALLBACK_PRODUCTS } from "./menu-data";

export type Restaurant = {
  slug: string;
  name: string;
  cuisine: string;
  address: string;
  district: string;
  phone: string;
  rating: number;
  reviews: number;
  priceLevel: string;
  hours: string;
  image: string;
  about: string;
  tags: string[];
  categories: string[];
  priceFactor: number;
};

export const RESTAURANTS: Restaurant[] = [
  {
    slug: "hestia",
    name: "Hestia Kitchen",
    cuisine: "Yevropa · Brunch",
    address: "Amir Temur ko'chasi 21",
    district: "Yunusobod",
    phone: "+998 71 200 45 67",
    rating: 4.8,
    reviews: 214,
    priceLevel: "$$",
    hours: "09:00 — 23:00",
    image: resto1,
    about:
      "Yorug' zal, ochiq oshxona va har kuni yangi pishirilgan non. Brunch va kechki taomlar uchun.",
    tags: ["Ochiq oshxona", "Wi-Fi", "Veranda"],
    categories: ["cat-issiq", "cat-salat", "cat-shirin", "cat-choy"],
    priceFactor: 1.1,
  },
  {
    slug: "choyxona-nur",
    name: "Choyxona Nur",
    cuisine: "Milliy · Choyxona",
    address: "Navoiy ko'chasi 8",
    district: "Chilonzor",
    phone: "+998 71 244 10 22",
    rating: 4.9,
    reviews: 431,
    priceLevel: "$",
    hours: "08:00 — 22:00",
    image: resto2,
    about: "Tandir non, qozon osh va choynakda damlangan ko'k choy. Oilaviy davralar uchun.",
    tags: ["Oilaviy zal", "Tandir", "Parkovka"],
    categories: ["cat-mil", "cat-choy", "cat-shirin"],
    priceFactor: 0.9,
  },
  {
    slug: "ember-grill",
    name: "Ember Grill",
    cuisine: "Grill · Steak",
    address: "Mustaqillik shoh ko'chasi 54",
    district: "Mirzo Ulug'bek",
    phone: "+998 71 233 77 90",
    rating: 4.7,
    reviews: 188,
    priceLevel: "$$$",
    hours: "12:00 — 00:00",
    image: resto3,
    about: "Ko'mirda pishirilgan go'sht, jonli musiqa va kechki yorug'lik. Kechki uchrashuvlar uchun.",
    tags: ["Jonli musiqa", "Bar", "Banket zali"],
    categories: ["cat-issiq", "cat-mil", "cat-salat"],
    priceFactor: 1.35,
  },
  {
    slug: "sabzi-bar",
    name: "Sabzi Bar",
    cuisine: "Salat · Sog'lom ovqat",
    address: "Shota Rustaveli 12",
    district: "Yakkasaroy",
    phone: "+998 71 255 30 14",
    rating: 4.6,
    reviews: 96,
    priceLevel: "$$",
    hours: "10:00 — 21:00",
    image: resto1,
    about: "Yengil salatlar, smuzi va kunlik sho'rvalar. Tez tushlik uchun eng qulay joy.",
    tags: ["Vegetarian", "Tez tushlik", "Olib ketish"],
    categories: ["cat-salat", "cat-choy", "cat-issiq"],
    priceFactor: 1,
  },
  {
    slug: "shirin-uy",
    name: "Shirin Uy",
    cuisine: "Qandolat · Kofe",
    address: "Bobur ko'chasi 3",
    district: "Mirobod",
    phone: "+998 71 267 18 05",
    rating: 4.8,
    reviews: 152,
    priceLevel: "$",
    hours: "09:00 — 22:00",
    image: resto2,
    about: "Uy sharoitida pishirilgan tortlar, chak-chak va maxsus damlangan kofe.",
    tags: ["Shirinliklar", "Kofe", "Bolalar burchagi"],
    categories: ["cat-shirin", "cat-choy"],
    priceFactor: 0.85,
  },
  {
    slug: "osh-markazi",
    name: "Osh Markazi",
    cuisine: "Milliy · Osh",
    address: "Beruniy ko'chasi 40",
    district: "Shayxontohur",
    phone: "+998 71 214 66 31",
    rating: 4.9,
    reviews: 605,
    priceLevel: "$$",
    hours: "11:00 — 17:00",
    image: resto3,
    about: "Kunning yarmida tugaydigan mashhur osh. Katta davralar uchun oldindan bron tavsiya etiladi.",
    tags: ["Mashhur", "Katta zal", "Olib ketish"],
    categories: ["cat-mil", "cat-issiq", "cat-choy"],
    priceFactor: 1.05,
  },
];

export const getRestaurant = (slug: string) => RESTAURANTS.find((r) => r.slug === slug);

const round = (n: number) => Math.round(n / 500) * 500;

export function restaurantMenu(r: Restaurant): Product[] {
  return FALLBACK_PRODUCTS.filter((p) => r.categories.includes(String(p.category))).map((p) => ({
    ...p,
    _id: `${r.slug}-${p._id}`,
    price: round(p.price * r.priceFactor),
  }));
}

export function restaurantTables(r: Restaurant, dateISO: string): Table[] {
  const seed = [...(r.slug + dateISO)].reduce((s, c) => s + c.charCodeAt(0), 0);
  const locations = ["Zal", "Deraza yonida", "Veranda", "Ikkinchi qavat"];
  return Array.from({ length: 8 }, (_, i) => ({
    _id: `${r.slug}-t${i + 1}`,
    number: i + 1,
    capacity: [2, 2, 4, 4, 4, 6, 6, 8][i] ?? 4,
    location: locations[(seed + i) % locations.length] ?? "Zal",
    isReserved: (seed + i * 7) % 5 === 0,
  }));
}
