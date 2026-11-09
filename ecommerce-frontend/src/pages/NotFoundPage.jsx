import { FiCompass } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageShell } from '@/components/layout/PageShell';
import { ROUTES } from '@/lib/constants';

export default function NotFoundPage() {
  return (
    <PageShell width="narrow">
      <p className="font-display text-display-lg text-brand-200">404</p>

      <EmptyState
        icon={FiCompass}
        title="We could not find that page"
        body="The link may be broken, or the page may have moved. Everything in the store is reachable from the shop."
        action={
          <div className="flex flex-wrap gap-2">
            <Button to={ROUTES.SHOP}>Browse the shop</Button>
            <Button to={ROUTES.HOME} variant="secondary">
              Back to home
            </Button>
          </div>
        }
        className="mt-6"
      />
    </PageShell>
  );
}
