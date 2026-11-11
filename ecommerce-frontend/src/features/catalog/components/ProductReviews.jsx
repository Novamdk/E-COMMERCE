import { useState } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Rating } from '@/components/ui/Rating';
import { useT } from '@/features/i18n';
import REVIEWS from '@/data/reviews.json';

const PAGE = 6;

/**
 * Customer reviews moved over from the old WordPress store, in each
 * reviewer's original words with their original stars and date. Duplicates,
 * copied marketplace text, other brands' reviews and medical claims were left
 * out when they were moved (Nov 2026). "Verified buyer" only where the old
 * store marked the review verified.
 *
 * @param {{ productId: string }} props
 */
export function ProductReviews({ productId }) {
  const { t, language } = useT();
  const [shown, setShown] = useState(PAGE);
  const reviews = REVIEWS[productId] ?? [];
  if (!reviews.length) return null;

  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const formatDate = (iso) =>
    new Intl.DateTimeFormat(language, { year: 'numeric', month: 'long', day: 'numeric' }).format(
      new Date(`${iso}T12:00:00Z`),
    );

  return (
    <section aria-labelledby="product-reviews" className="border-border mb-16 border-t pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h2 id="product-reviews" className="font-display text-display-sm">
            {t('product.reviewsTitle')}
          </h2>
          <Rating value={average} reviewCount={reviews.length} size="md" />
        </div>
        <p className="text-content-subtle max-w-md text-sm">{t('product.reviewsSource')}</p>
      </div>

      <ul className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2">
        {reviews.slice(0, shown).map((review) => (
          <li key={review.id} className="border-border space-y-2 border-b pb-8">
            <Rating value={review.rating} />
            <p className="text-content-muted leading-relaxed whitespace-pre-line">{review.text}</p>
            <p className="text-content-subtle flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="text-content font-medium">{review.name}</span>
              {review.verified && (
                <span className="text-brand-700 inline-flex items-center gap-1">
                  <FiCheckCircle aria-hidden="true" className="size-3.5" />
                  {t('product.reviewVerified')}
                </span>
              )}
              <time dateTime={review.date}>{formatDate(review.date)}</time>
            </p>
          </li>
        ))}
      </ul>

      {shown < reviews.length && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline" onClick={() => setShown((count) => count + PAGE)}>
            {t('product.reviewsMore')}
          </Button>
        </div>
      )}
    </section>
  );
}
