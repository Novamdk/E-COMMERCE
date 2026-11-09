import { Skeleton } from '@/components/ui/Skeleton';
import { Container } from './Container';

/** Suspense fallback while a route chunk downloads. */
export function RouteFallback() {
  return (
    <Container className="py-14">
      <span className="sr-only" role="status">
        Loading page
      </span>
      <div className="space-y-4">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton radius="card" className="aspect-[4/5] w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </Container>
  );
}
