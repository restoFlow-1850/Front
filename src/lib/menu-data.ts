import type { Category, Product } from "./api";
import dish1 from "@/assets/dish-1.jpg";
import dish2 from "@/assets/dish-2.jpg";
import dish3 from "@/assets/dish-3.jpg";

export const FALLBACK_CATEGORIES: Category[] = [
  { _id: "cat-issiq", name: "Issiq taomlar" },
  { _id: "cat-mil", name: "Milliy taomlar" },
  { _id: "cat-salat", name: "Salatlar" },
  { _id: "cat-choy", name: "Choy va ichimliklar" },
  { _id: "cat-shirin", name: "Shirinliklar" },
];

const img = (i: number) => [dish1, dish2, dish3][i % 3];

export const FALLBACK_PRODUCTS: Product[] = [
  { _id: "p1", name: "Osh (palov)", price: 45000, description: "Ziravorli guruch, yumshoq mol go'shti va sariq sabzi bilan", image: img(0), isAvailable: true, stock: 20, category: "cat-mil" },
  { _id: "p2", name: "Manti", price: 38000, description: "Bug'da pishirilgan, go'shtli va qovoqli, qatiq bilan", image: img(1), isAvailable: true, stock: 15, category: "cat-mil" },
  { _id: "p3", name: "Lag'mon", price: 40000, description: "Qo'lda cho'zilgan noodle, sabzavotli kayla bilan", image: img(2), isAvailable: true, stock: 12, category: "cat-mil" },
  { _id: "p4", name: "Somsa", price: 12000, description: "Tandirda pishgan, go'shtli yoki qovoqli", image: img(0), isAvailable: true, stock: 40, category: "cat-mil" },
  { _id: "p5", name: "Shashlik (mol go'sht)", price: 22000, description: "Ko'mirda qovurilgan, piyoz va achchiq sous bilan", image: img(1), isAvailable: true, stock: 25, category: "cat-issiq" },
  { _id: "p6", name: "Qozon kabob", price: 52000, description: "Qozonda tovlanib pishirilgan mol go'shti va kartoshka", image: img(2), isAvailable: true, stock: 8, category: "cat-issiq" },
  { _id: "p7", name: "Tovuqli gril", price: 35000, description: "Ziravorlar bilan marinadlangan, achchiq kartoshka bilan", image: img(0), isAvailable: true, stock: 10, category: "cat-issiq" },
  { _id: "p8", name: "Mastava", price: 18000, description: "Mol go'shtli quyuq sho'rva, smetana bilan", image: img(1), isAvailable: true, stock: 30, category: "cat-issiq" },
  { _id: "p9", name: "Achchiq-chuchuk", price: 15000, description: "Yangi pomidor, piyoz va ziravorlar bilan yengil salat", image: img(2), isAvailable: true, stock: 20, category: "cat-salat" },
  { _id: "p10", name: "Sezar salat", price: 32000, description: "Tovuq, romano salat, kruton va parmezan bilan", image: img(0), isAvailable: true, stock: 12, category: "cat-salat" },
  { _id: "p11", name: "Smak (Yevropa salati)", price: 28000, description: "Baliq va yangi sabzavotlar bilan engil salat", image: img(1), isAvailable: false, stock: 0, category: "cat-salat" },
  { _id: "p12", name: "Ko'k choy", price: 8000, description: "Toza ko'k choy, choynakda beriladi", image: img(2), isAvailable: true, stock: 100, category: "cat-choy" },
  { _id: "p13", name: "Moychechak choyi", price: 10000, description: "Ra'noli dorivor choy, asal bilan beriladi", image: img(0), isAvailable: true, stock: 100, category: "cat-choy" },
  { _id: "p14", name: "Chak-chak", price: 14000, description: "Asalli sharbatda o'ralgan mayin sharinlik", image: img(1), isAvailable: true, stock: 18, category: "cat-shirin" },
  { _id: "p15", name: "Napoleon torti", price: 20000, description: "Qatlama-qatlam, vanil kremli tort bo'lagi", image: img(2), isAvailable: true, stock: 10, category: "cat-shirin" },
];
