export default function RestaurantCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#4a1616] bg-[#1c0a0b]">
      {/* Image skeleton */}
      <div className="aspect-[16/10] animate-pulse bg-[#2a1315]" />

      {/* Body skeleton */}
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-2/3 animate-pulse rounded bg-[#2a1315]" />
          <div className="h-4 w-4 animate-pulse rounded bg-[#2a1315]" />
        </div>
        <div className="h-4 w-1/3 animate-pulse rounded-full bg-[#2a1315]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[#2a1315]" />
        <div className="space-y-1.5">
          <div className="h-3 w-full animate-pulse rounded bg-[#2a1315]" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-[#2a1315]" />
        </div>
      </div>
    </div>
  )
}
