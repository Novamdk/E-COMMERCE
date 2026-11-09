import { Skeleton } from '@/components/ui/Skeleton';

/** Mirrors ProductCard's box so the grid does not reflow when data lands. */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton radius="card" className="aspect-square w-full" />
      <div className="flex flex-col items-center gap-2.5 pt-5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="mt-1 h-5 w-20" />
        <Skeleton className="mt-2 h-10 w-full" />
      </div>
    </div>
  );
}
