import { formatSum, type Product } from "@/lib/api";
import { useCart } from "@/lib/cart";
import dish1 from "@/assets/dish-1.jpg";
import dish2 from "@/assets/dish-2.jpg";
import dish3 from "@/assets/dish-3.jpg";

const fallbacks = [dish1, dish2, dish3];

export function MenuCard({ product, index }: { product: Product; index: number }) {
  const { add } = useCart();
  const available = product.isAvailable !== false && (product.stock ?? 1) > 0;
  const src = product.image || fallbacks[index % fallbacks.length];

  return (
    <article className="card rounded-[22px] border border-ink/5 bg-paper/80 p-5 backdrop-blur-md">
      <img
        src={src}
        alt={product.name}
        loading="lazy"
        width={1024}
        height={768}
        className="aspect-[4/3] w-full rounded-[16px] object-cover outline-1 -outline-offset-1 outline-ink/5"
      />
      <div className="mt-4 flex items-start justify-between gap-3">
        <h3 className="font-display text-xl text-ink">{product.name}</h3>
        <span className="mt-1 whitespace-nowrap text-sm font-semibold text-ink">
          {formatSum(product.price)}
        </span>
      </div>
      {product.description && (
        <p className="mt-1.5 text-pretty text-sm text-soft">{product.description}</p>
      )}
      <div className="mt-4 flex items-center justify-between">
        {available ? (
          <span className="rounded-full bg-mint/60 px-2.5 py-1 text-[11px] font-medium text-ink">
            Bor
          </span>
        ) : (
          <span className="rounded-full bg-butter/70 px-2.5 py-1 text-[11px] font-medium text-ink">
            Yetmayapti
          </span>
        )}
        <button
          disabled={!available}
          onClick={() => add(product)}
          className={
            available
              ? "rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-cream transition-colors hover:bg-ink/85"
              : "cursor-not-allowed rounded-full bg-ink/10 px-3.5 py-1.5 text-xs font-medium text-soft"
          }
        >
          Qo'shish
        </button>
      </div>
    </article>
  );
}
