import { useState } from 'react';
import { FiCheck, FiChevronRight } from 'react-icons/fi';
import { email as validateEmail, phone as validatePhone } from '@/lib/validators';
import { useT } from '@/features/i18n';

/**
 * One pill field with its submit button inside it, as on Olaplex's footer.
 * Validates locally and thanks the shopper; nothing is sent anywhere until an
 * email/SMS service is connected.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {'email'|'tel'} props.type
 * @param {string} props.label
 * @param {string} props.cta
 * @param {(value: string) => string|null} props.validate
 * @param {string} props.errorText
 * @param {string} props.thanks
 */
function PillForm({ id, type, label, cta, validate, errorText, thanks }) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus(validate(value) ? 'error' : 'done');
  };

  if (status === 'done') {
    return (
      <p className="border-content-inverse/30 flex h-12 items-center gap-2 rounded-full border px-5 text-sm">
        <FiCheck aria-hidden="true" className="size-4 shrink-0" />
        {thanks}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="border-content-inverse/40 focus-within:border-content-inverse flex h-12 items-center rounded-full border pr-1.5 pl-5 transition-colors">
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <input
          id={id}
          type={type}
          autoComplete={type === 'email' ? 'email' : 'tel'}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setStatus('idle');
          }}
          placeholder={label}
          aria-invalid={status === 'error' || undefined}
          aria-describedby={`${id}-error`}
          className="placeholder:text-content-inverse/60 min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        <button
          type="submit"
          className="hover:bg-content-inverse hover:text-content flex h-9 shrink-0 items-center gap-1 rounded-full px-3 text-[0.625rem] font-bold tracking-[0.12em] uppercase transition-colors"
        >
          {cta}
          <FiChevronRight aria-hidden="true" className="size-3.5" />
        </button>
      </div>
      <p
        id={`${id}-error`}
        aria-live="polite"
        className="text-danger-500 mt-1 min-h-4 pl-5 text-xs"
      >
        {status === 'error' ? errorText : ''}
      </p>
    </form>
  );
}

/**
 * "Sign up for SK Envision updates": consent copy and separate email and
 * text sign-ups. The footer below carries the monogram.
 * Placeholder until a mailing and SMS service is connected.
 */
export function SignUpBand() {
  const { t } = useT();

  return (
    <section aria-labelledby="signup-heading" className="border-content-inverse/15 border-b pb-14">
      <div className="max-w-2xl">
        <h2 id="signup-heading" className="font-display text-display-sm sm:text-display">
          {t('signup.title')}
        </h2>
        <p className="text-content-inverse/70 mt-3 text-xs leading-relaxed">
          {t('signup.consent')}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <PillForm
            id="signup-email"
            type="email"
            label={t('signup.email')}
            cta={t('signup.emailCta')}
            validate={validateEmail}
            errorText={t('quiz.unlock.emailError')}
            thanks={t('signup.thanksEmail')}
          />
          <PillForm
            id="signup-phone"
            type="tel"
            label={t('signup.phone')}
            cta={t('signup.phoneCta')}
            validate={validatePhone}
            errorText={t('signup.phoneError')}
            thanks={t('signup.thanksPhone')}
          />
        </div>
      </div>
    </section>
  );
}
