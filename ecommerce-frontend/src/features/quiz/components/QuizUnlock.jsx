import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { PROMO_CODES, QUIZ_PROMO_CODE } from '@/lib/constants';
import { email as validateEmail } from '@/lib/validators';
import { useCart } from '@/features/cart';
import { useT } from '@/features/i18n';

const PROMO = PROMO_CODES[QUIZ_PROMO_CODE];

/**
 * The step between the last question and the results: leave an email (phone
 * and first name optional) to unlock 15% off plus free shipping, which is
 * applied to the bag straight away. Skipping goes to the same results.
 *
 * Nothing is sent anywhere yet: there is no email service connected, so the
 * details stay in the browser until one is wired up.
 *
 * @param {object} props
 * @param {(didUnlock: boolean) => void} props.onDone
 */
export function QuizUnlock({ onDone }) {
  const { t } = useT();
  const { applyPromo } = useCart();
  const [values, setValues] = useState({ email: '', phone: '', firstName: '' });
  const [error, setError] = useState('');

  const update = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateEmail(values.email)) {
      setError(t('quiz.unlock.emailError'));
      return;
    }
    applyPromo(PROMO.code);
    onDone(true);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-md">
      <h1 id="quiz-question" className="font-display text-display-sm sm:text-display">
        {t('quiz.unlock.title', { percent: PROMO.value })}
      </h1>
      <p className="text-content-muted mt-3 text-sm">{t('quiz.unlock.body')}</p>

      <div className="mt-8 space-y-4">
        <FormField id="quiz-email" label={t('quiz.unlock.email')} error={error || null}>
          <Input
            id="quiz-email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={update('email')}
            hasError={Boolean(error)}
            aria-describedby={error ? 'quiz-email-error' : undefined}
          />
        </FormField>
        <FormField id="quiz-phone" label={t('quiz.unlock.phone')} isOptional>
          <Input
            id="quiz-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1"
            value={values.phone}
            onChange={update('phone')}
          />
        </FormField>
        <FormField id="quiz-name" label={t('quiz.unlock.firstName')} isOptional>
          <Input
            id="quiz-name"
            autoComplete="given-name"
            value={values.firstName}
            onChange={update('firstName')}
          />
        </FormField>
      </div>

      <p className="text-content-muted mt-5 text-xs leading-relaxed">{t('quiz.unlock.consent')}</p>

      <div className="mt-6 flex items-center gap-3">
        <Button type="submit" size="lg" className="flex-1">
          {t('quiz.unlock.continue')}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => onDone(false)}>
          {t('quiz.unlock.skip')}
        </Button>
      </div>
    </form>
  );
}
