import {
  fetchCategories,
  fetchProducts,
  fetchTables,
  fetchVenue,
  submitCallWaiter,
  submitReservation,
} from "@/lib/backend.functions";

export type Category = {
  _id: string;
  name: string;
  color?: string;
  isActive?: boolean;
};

export type Product = {
  _id: string;
  name: string;
  price: number;
  description?: string;
  image?: string | null;
  isAvailable?: boolean;
  stock?: number;
  category?: Category | string | null;
};

export type Table = {
  _id: string;
  number: number;
  capacity: number;
  location?: string;
  status?: string;
  isReserved?: boolean;
};

export type Venue = {
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  openingTime?: string;
  closingTime?: string;
  rating?: number;
  reviewsCount?: number;
};

export type ReservationInput = {
  customerName: string;
  customerPhone: string;
  table: string;
  date: string;
  guests: number;
  notes?: string;
  items?: { product: string; quantity: number }[];
};

export const getVenue = () => fetchVenue();
export const getCategories = () => fetchCategories();
export const getProducts = () => fetchProducts();
export const getTables = (date: string) => fetchTables({ data: { date } });

export async function createReservation(input: ReservationInput) {
  const res = await submitReservation({ data: input });
  if (!res.ok) throw new Error(res.message);
}

export async function callWaiter(tableId: string, type: "call" | "bill_cash" | "bill_card" = "call") {
  const res = await submitCallWaiter({ data: { tableId, type } });
  if (!res.ok) throw new Error(res.message);
}

export const formatSum = (n: number) =>
  n.toLocaleString("uz-UZ").replace(/,/g, " ") + " so'm";
