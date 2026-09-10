import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const API = "https://backend-production-109c0.up.railway.app/api";

async function login(): Promise<string> {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env["BACKEND_EMAIL"],
      password: process.env["BACKEND_PASSWORD"],
    }),
  });
  const json = (await res.json().catch(() => null)) as {
    success: boolean;
    message?: string;
    data?: { accessToken?: string };
  } | null;
  const token = json?.data?.accessToken;
  if (!res.ok || !token) throw new Error(json?.message || "Backend'ga kirishda xatolik");
  return token;
}

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
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => null)) as {
        success: boolean;
        message?: string;
        data?: { _id?: string; order?: { _id?: string } };
      } | null;
      if (!res.ok || !json || json.success === false) {
        return { ok: false as const, message: json?.message || "Buyurtma yuborilmadi" };
      }
      return {
        ok: true as const,
        message: json.message || "Buyurtma qabul qilindi",
        orderId: json.data?.order?._id ?? json.data?._id ?? null,
      };
    } catch (e) {
      return { ok: false as const, message: e instanceof Error ? e.message : "Server xatosi" };
    }
  });
