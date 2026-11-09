import { useMemo, useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/layout/Container';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { PROMO_CODES, QUIZ_PROMO_CODE } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatCurrency';
import { email as validateEmail } from '@/lib/validators';
import { useCart } from '@/features/cart';
import { ProductCarousel, ProductGrid } from '@/features/catalog';
import { useT } from '@/features/i18n';

const PROMO = PROMO_CODES[QUIZ_PROMO_CODE];

/**
 * The routine the answers point to, an "add all to bag" for the ones that
 * need no size or shade picked, the unlocked offer (or a last chance to
 * unlock it by emailing the results), and the sets underneath.
 *
 * @param {object} props
 * @param {object} props.quiz
 * @param {Record<string, string>} props.answers
 * @param {object[]} props.products
 * @param {boolean} props.hasUnlocked
 * @param {() => void} props.onUnlock
 * @param {() => void} props.onRestart
 */
export function QuizResults({ quiz, answers, products, hasUnlocked, onUnlock, onRestart }) {
  const { t } = useT();
  const { addItem, applyPromo, openDrawer } = useCart();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const picks = useMemo(() => {
    const byId = new Map(products.map((product) => [product.id, product]));
    return quiz
      .recommend(answers, products)
      .map((id) => byId.get(id))
      .filter(Boolean);
  }, [quiz, answers, products]);

  const bundles = products.filter((product) => product.categories.includes('packages'));

  const addable = picks.filter(
    (product) =>
      product.stock > 0 &&
      product.variants.sizes.length === 0 &&
      product.variants.colors.length === 0,
  );
  const addableTotal = addable.reduce((sum, product) => sum + product.price, 0);

  const addAll = () => {
    addable.forEach((product) => addItem(product, { qty: 1 }));
    openDrawer();
  };

  const handleEmail = (event) => {
    event.preventDefault();
    if (validateEmail(email)) {
      setError(t('quiz.unlock.emailError'));
      return;
    }
    applyPromo(PROMO.code);
    onUnlock();
  };

  return (
    <>
      <Container
        as="section"
        width="wide"
        aria-labelledby="results-heading"
        className="py-14 lg:py-20"
      >
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-gold-600 text-[0.6875rem] font-semibold tracking-[0.18em] uppercase">
              {t(quiz.title)}
            </p>
            <h1 id="results-heading" className="font-display text-display-sm sm:text-display mt-3">
              {t(quiz.resultsTitle)}
            </h1>
          </div>
          <button
            type="button"
            onClick={onRestart}
            className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase underline underline-offset-4"
          >
            {t('quiz.retake')}
          </button>
        </div>

        {hasUnlocked && (
          <p className="bg-gold-sheen text-brand-900 mt-8 flex items-center gap-3 px-5 py-4 text-sm font-semibold">
            <FiCheck aria-hidden="true" className="size-5 shrink-0" />
            {t('quiz.results.unlocked', { percent: PROMO.value, code: PROMO.code })}
          </p>
        )}

        <div className="mt-8">
          <ProductGrid products={picks} columns={3} hasPriorityImages />
        </div>

        {addable.length > 1 && (
          <div className="mt-6 flex justify-center">
            <Button size="lg" onClick={addAll}>
              {t('quiz.results.addAll', { price: formatCurrency(addableTotal) })}
            </Button>
          </div>
        )}
      </Container>

      {!hasUnlocked && (
        <section aria-labelledby="email-results" className="bg-surface-sunken">
          <Container width="wide" className="grid items-center gap-8 py-14 md:grid-cols-2">
            <div className="max-w-md">
              <h2 id="email-results" className="font-display text-display-sm">
                {t('quiz.results.emailTitle')}
              </h2>
              <p className="text-content-muted mt-3 text-sm">
                {t('quiz.results.emailBody', { percent: PROMO.value })}
              </p>
            </div>
            <form
              onSubmit={handleEmail}
              noValidate
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <FormField
                id="results-email"
                label={t('quiz.unlock.email')}
                error={error || null}
                className="flex-1"
              >
                <Input
                  id="results-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  hasError={Boolean(error)}
                />
              </FormField>
              <Button type="submit" size="md">
                {t('quiz.results.emailCta')}
              </Button>
            </form>
          </Container>
        </section>
      )}

      {bundles.length > 0 && (
        <Container
          as="section"
          width="wide"
          aria-labelledby="bundles-heading"
          className="py-14 lg:py-20"
        >
          <h2 id="bundles-heading" className="font-display text-display-sm mb-8">
            {t('quiz.results.bundles')}
          </h2>
          <ProductCarousel products={bundles} label={t('quiz.results.bundles')} />
        </Container>
      )}
    </>
  );
}
