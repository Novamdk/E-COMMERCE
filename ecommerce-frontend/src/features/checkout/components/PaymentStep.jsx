import { FiLock } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';

/** Groups digits into 4s as the shopper types. @param {string} value */
const formatCardNumber = (value) =>
  value
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim();

/** Inserts the slash in MM/YY. @param {string} value */
const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

/**
 * @param {object} props
 * @param {object} props.form the useCheckoutForm instance
 * @param {() => void} props.onContinue
 * @param {() => void} props.onBack
 */
export function PaymentStep({ form, onContinue, onBack }) {
  const errors = form.errorsForStep('payment');

  /** Wires a masked field: the mask runs on change, before validation sees it. */
  const maskedProps = (fieldName, mask) => {
    const base = form.getFieldProps(fieldName);
    return {
      ...base,
      onChange: (event) => form.setValue(fieldName, mask(event.target.value)),
      hasError: Boolean(errors[fieldName]),
      'aria-describedby': errors[fieldName] ? `${fieldName}-error` : undefined,
    };
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onContinue();
      }}
      noValidate
      className="space-y-8"
    >
      <p className="rounded-field bg-surface-brand text-brand-700 flex items-start gap-2.5 px-3.5 py-3 text-xs leading-relaxed">
        <FiLock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>
          This is a demo storefront. No card is charged, nothing is sent anywhere, and card details
          are never saved — enter any Luhn-valid test number, such as 4242 4242 4242 4242.
        </span>
      </p>

      <fieldset className="space-y-4">
        <legend className="font-display mb-4 text-xl">Card details</legend>

        <FormField id="cardholder" label="Name on card" error={errors.cardholder}>
          <Input
            autoComplete="cc-name"
            placeholder="Jordan Reyes"
            hasError={Boolean(errors.cardholder)}
            aria-describedby={errors.cardholder ? 'cardholder-error' : undefined}
            {...form.getFieldProps('cardholder')}
          />
        </FormField>

        <FormField id="cardNumber" label="Card number" error={errors.cardNumber}>
          <Input
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="4242 4242 4242 4242"
            {...maskedProps('cardNumber', formatCardNumber)}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField id="cardExpiry" label="Expiry" error={errors.cardExpiry}>
            <Input
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              {...maskedProps('cardExpiry', formatExpiry)}
            />
          </FormField>

          <FormField id="cardCvc" label="Security code" error={errors.cardCvc}>
            <Input
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              {...maskedProps('cardCvc', (v) => v.replace(/\D/g, '').slice(0, 4))}
            />
          </FormField>
        </div>
      </fieldset>

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <Button type="submit" size="lg" className="sm:flex-1">
          Review your order
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={onBack}>
          Back to shipping
        </Button>
      </div>
    </form>
  );
}
