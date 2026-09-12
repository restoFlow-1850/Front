import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const API = "https://backend-production-109c0.up.railway.app/api";

async function apiRequest<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const json = (await res.json().catch(() => null)) as {
    success: boolean;
    message?: string;
    data?: unknown;
  } | null;
  if (!res.ok || !json || json.success === false) {
    throw new Error(json?.message || "So'rovda xatolik yuz berdi");
  }
  return json.data as T;
}

async function login(): Promise<string> {
  const data = await apiRequest<{ accessToken?: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: process.env["BACKEND_EMAIL"],
      password: process.env["BACKEND_PASSWORD"],
    }),
  });
  if (!data.accessToken) throw new Error("Backend'ga kirishda xatolik");
  return data.accessToken;
}

type Category = { _id: string; name: string; color?: string; isActive?: boolean };
type Product = {
  _id: string;
  name: string;
  price: number;
  description?: string;
  image?: string | null;
  isAvailable?: boolean;
  stock?: number;
  category?: Category | string | null;
};
type Table = {
  _id: string;
  number: number;
  capacity: number;
  location?: string;
  status?: string;
  isReserved?: boolean;
};
type Venue = {
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

export const fetchVenue = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await apiRequest<Venue>("/clients/default");
  } catch {
    return null;
  }
});

export const fetchCategories = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const d = await apiRequest<{ categories: Category[] }>("/categories");
    if (d.categories?.length) return d.categories;
  } catch {
    /* fallback */
  }
  const { FALLBACK_CATEGORIES } = await import("./menu-data");
  return FALLBACK_CATEGORIES;
});

export const fetchProducts = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const d = await apiRequest<{ products: Product[] }>("/products?limit=100");
    if (d.products?.length) return d.products;
  } catch {
    /* fallback */
  }
  const { FALLBACK_PRODUCTS } = await import("./menu-data");
  return FALLBACK_PRODUCTS;
});

export const fetchTables = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ date: z.string() }).parse(data))
  .handler(async ({ data }) => {
    try {
      const d = await apiRequest<{ tables: Table[] }>(
        `/tables/availability?date=${encodeURIComponent(data.date)}`,
      );
      return d.tables ?? [];
    } catch {
      return [];
    }
  });

const reservationSchema = z.object({
  customerName: z.string(),
  customerPhone: z.string(),
  table: z.string(),
  date: z.string(),
  guests: z.number(),
  notes: z.string().optional(),
  items: z.array(z.object({ product: z.string(), quantity: z.number() })).optional(),
});

export const submitReservation = createServerFn({ method: "POST" })
  .inputValidator((data) => reservationSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      await apiRequest<unknown>("/reservations", { method: "POST", body: JSON.stringify(data) });
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, message: e instanceof Error ? e.message : "Xatolik" };
    }
  });

export const submitCallWaiter = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({ tableId: z.string(), type: z.enum(["call", "bill_cash", "bill_card"]).default("call") })
      .parse(data),
  )
  .handler(async ({ data }) => {
    try {
      await apiRequest<unknown>(`/tables/${data.tableId}/call-waiter`, {
        method: "POST",
        body: JSON.stringify({ type: data.type }),
      });
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, message: e instanceof Error ? e.message : "Xatolik" };
    }
  });

const orderSchema = z.object({
  table: z.string().min(1),
  items: z
    .array(
      z.object({
        product: z.string().min(1),
        quantity: z.number().int().positive(),
        note: z.string().optional(),
      }),
    )
    .min(1),
  notes: z.string().optional(),
});

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((data) => orderSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const token = await login();
      const d = await apiRequest<{ order?: { _id?: string }; _id?: string }>("/orders", {
        method: "POST",
        body: JSON.stringify(data),
      }, token);
      return {
        ok: true as const,
        message: "Buyurtma qabul qilindi",
        orderId: d.order?._id ?? d._id ?? null,
      };
    } catch (e) {
      return { ok: false as const, message: e instanceof Error ? e.message : "Server xatosi" };
    }
  });
