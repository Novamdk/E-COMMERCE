import { Skeleton } from '@/components/ui/Skeleton';

/** Mirrors ProductCard's box so the grid does not reflow when data lands. */
export function ProductCardSkeleton() {
  return (
    <div className="bg-surface-sunken flex flex-col p-5 sm:p-6">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="mt-2 aspect-[4/5] w-full" />
      <div className="flex flex-col gap-2.5 pt-5">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3.5 w-24" />
        <div className="mt-3 flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-9 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}
