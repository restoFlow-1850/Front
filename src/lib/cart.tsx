import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "./api";

export type CartLine = { id: string; name: string; price: number; quantity: number };

type CartCtx = {
  lines: CartLine[];
  total: number;
  count: number;
  add: (p: Product) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "uchxona-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines]);

  const value = useMemo<CartCtx>(() => {
    return {
      lines,
      open,
      setOpen,
      total: lines.reduce((s, l) => s + l.price * l.quantity, 0),
      count: lines.reduce((s, l) => s + l.quantity, 0),
      add: (p) =>
        setLines((prev) => {
          const found = prev.find((l) => l.id === p._id);
          if (found)
            return prev.map((l) => (l.id === p._id ? { ...l, quantity: l.quantity + 1 } : l));
          return [...prev, { id: p._id, name: p.name, price: p.price, quantity: 1 }];
        }),
      setQty: (id, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => l.id !== id)
            : prev.map((l) => (l.id === id ? { ...l, quantity: qty } : l)),
        ),
      clear: () => setLines([]),
    };
  }, [lines, open]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
