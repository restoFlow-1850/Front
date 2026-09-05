export const API_BASE = "https://backend-production-109c0.up.railway.app/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = (await res.json().catch(() => null)) as
    | { success: boolean; message?: string; data?: unknown }
    | null;
  if (!res.ok || !json || json.success === false) {
    throw new Error(json?.message || "So'rovda xatolik yuz berdi");
  }
  return json.data as T;
}

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

export const getVenue = () => request<Venue>("/clients/default");

export const getCategories = () =>
  request<{ categories: Category[] }>("/categories")
    .then((d) => d.categories ?? [])
    .catch(async () => {
      const { FALLBACK_CATEGORIES } = await import("./menu-data");
      return FALLBACK_CATEGORIES;
    });

export const getProducts = () =>
  request<{ products: Product[] }>("/products?limit=100")
    .then((d) => (d.products?.length ? d.products : Promise.reject(new Error("Bo'sh"))))
    .catch(async () => {
      const { FALLBACK_PRODUCTS } = await import("./menu-data");
      return FALLBACK_PRODUCTS;
    });

export const getTables = (dateISO: string) =>
  request<{ tables: Table[] }>(
    `/tables/availability?date=${encodeURIComponent(dateISO)}`,
  ).then((d) => d.tables ?? []);

export type ReservationInput = {
  customerName: string;
  customerPhone: string;
  table: string;
  date: string;
  guests: number;
  notes?: string | undefined;
  items?: { product: string; quantity: number }[] | undefined;
};

export const createReservation = (body: ReservationInput) =>
  request<unknown>("/reservations", { method: "POST", body: JSON.stringify(body) });

export const callWaiter = (tableId: string, type: "call" | "bill_cash" | "bill_card" = "call") =>
  request<unknown>(`/tables/${tableId}/call-waiter`, {
    method: "POST",
    body: JSON.stringify({ type }),
  });

export const formatSum = (n: number) => new Intl.NumberFormat("uz-UZ").format(n);
