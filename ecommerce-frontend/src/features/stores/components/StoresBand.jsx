import { Link } from 'react-router-dom';
import { FiMapPin } from 'react-icons/fi';
import { Container } from '@/components/layout/Container';
import { ROUTES } from '@/lib/constants';
import { useT } from '@/features/i18n';

/**
 * One quiet line on the homepage saying the range is also on shop
 * shelves around Southern California, with a link to the store finder. Deliberately small: it
 * is a trust signal, not a section.
 */
export function StoresBand() {
  const { t } = useT();
  return (
    <section aria-label={t('stores.title')} className="border-border border-y">
      <Container
        width="wide"
        className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:justify-center sm:gap-8"
      >
        <p className="flex flex-col items-center gap-2 text-sm sm:flex-row sm:gap-3 sm:text-base">
          <FiMapPin aria-hidden="true" className="text-holiday-700 size-4 shrink-0" />
          {t('stores.band')}
        </p>
        <Link
          to={ROUTES.STORES}
          className="shrink-0 text-[0.6875rem] font-semibold tracking-[0.16em] uppercase underline underline-offset-[6px] transition-opacity hover:opacity-60"
        >
          {t('stores.find')}
        </Link>
      </Container>
    </section>
  );
}
