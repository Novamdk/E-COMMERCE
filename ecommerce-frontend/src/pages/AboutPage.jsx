import { useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { Image } from '@/components/ui/Image';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/layout/PageShell';
import { useAsync } from '@/hooks/useAsync';
import { ROUTES } from '@/lib/constants';
import { getSiteContent } from '@/services/productService';
import { FaqSection, IngredientsSection } from '@/features/marketing';

export default function AboutPage() {
  const fetchContent = useCallback(() => getSiteContent(), []);
  const { data, loading, error, refetch } = useAsync(fetchContent);

  if (loading) {
    return (
      <PageShell>
        <Skeleton className="h-4 w-36" />
        <Skeleton className="mt-5 h-12 w-2/3 max-w-lg" />
        <Skeleton className="mt-10 aspect-[16/7] w-full" radius="panel" />
        <div className="mt-10 max-w-2xl space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </PageShell>
    );
  }

  if (error || !data) {
    return (
      <PageShell>
        <ErrorPanel title="This page could not load" error={error} onRetry={refetch} />
      </PageShell>
    );
  }

  return (
    <>
      <PageShell>
        <PageHeader
          title={data.about.heading}
          description={data.brand.tagline}
          breadcrumbs={[{ label: 'Home', to: ROUTES.HOME }, { label: 'About' }]}
        />

        <Image
          name="hero-portrait"
          alt="A person applying a cream mask at home"
          sizes="(min-width: 1280px) 76rem, 100vw"
          ratio="aspect-[16/9] sm:aspect-[16/7]"
          className="rounded-panel mt-10"
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          <div className="max-w-2xl space-y-5">
            {data.about.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-content-muted text-lg leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          <aside className="rounded-panel border-border bg-surface-raised h-fit border p-6">
            <h2 className="font-display text-xl">What we stand by</h2>
            <ul className="mt-4 space-y-4">
              {data.benefits.map((benefit) => (
                <li key={benefit.title}>
                  <p className="text-sm font-medium">{benefit.title}</p>
                  <p className="text-content-muted mt-0.5 text-sm">{benefit.body}</p>
                </li>
              ))}
            </ul>
            <Button to={ROUTES.SHOP} isFullWidth className="mt-6">
              Shop the range
            </Button>
          </aside>
        </div>
      </PageShell>

      <div className="mt-20">
        <IngredientsSection ingredients={data.ingredients} />
      </div>
      <FaqSection faq={data.faq} />
    </>
  );
}
