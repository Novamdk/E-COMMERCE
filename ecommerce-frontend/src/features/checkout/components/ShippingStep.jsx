import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';
import { SHIPPING_METHODS } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatCurrency';

/**
 * @param {object} props
 * @param {object} props.form the useCheckoutForm instance
 * @param {() => void} props.onContinue
 */
export function ShippingStep({ form, onContinue }) {
  const errors = form.errorsForStep('shipping');

  /** @param {string} field @param {string} label @param {object} [extra] */
  const field = (fieldName, label, extra = {}) => (
    <FormField id={fieldName} label={label} error={errors[fieldName]} {...extra.fieldProps}>
      <Input
        hasError={Boolean(errors[fieldName])}
        aria-describedby={errors[fieldName] ? `${fieldName}-error` : undefined}
        {...extra.inputProps}
        {...form.getFieldProps(fieldName)}
      />
    </FormField>
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onContinue();
      }}
      noValidate
      className="space-y-8"
    >
      <fieldset className="space-y-4">
        <legend className="font-display mb-4 text-xl">Contact</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {field('firstName', 'First name', { inputProps: { autoComplete: 'given-name' } })}
          {field('lastName', 'Last name', { inputProps: { autoComplete: 'family-name' } })}
          {field('email', 'Email address', {
            inputProps: { type: 'email', autoComplete: 'email' },
          })}
          {field('phone', 'Phone number', { inputProps: { type: 'tel', autoComplete: 'tel' } })}
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display mb-4 text-xl">Delivery address</legend>
        <div className="grid gap-4">
          {field('address1', 'Street address', {
            inputProps: { autoComplete: 'address-line1' },
          })}
          <FormField id="address2" label="Apartment, suite, etc." isOptional>
            <Input autoComplete="address-line2" {...form.getFieldProps('address2')} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-3">
            {field('city', 'City', { inputProps: { autoComplete: 'address-level2' } })}
            {field('state', 'State', { inputProps: { autoComplete: 'address-level1' } })}
            {field('postalCode', 'ZIP code', {
              inputProps: { autoComplete: 'postal-code', inputMode: 'numeric' },
            })}
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-display mb-4 text-xl">Delivery speed</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {SHIPPING_METHODS.map((method) => {
            const isSelected = form.shippingMethodId === method.id;
            return (
              <label
                key={method.id}
                className={cn(
                  'rounded-card flex cursor-pointer items-start gap-3 border p-4 transition-colors',
                  isSelected
                    ? 'border-brand-700 bg-surface-brand'
                    : 'border-border hover:border-border-strong',
                )}
              >
                <input
                  type="radio"
                  name="shippingMethodId"
                  value={method.id}
                  checked={isSelected}
                  onChange={(event) => form.setValue('shippingMethodId', event.target.value)}
                  className="accent-brand-700 mt-0.5 size-4"
                />
                <span className="flex-1">
                  <span className="block text-sm font-medium">{method.label}</span>
                  <span className="text-content-muted block text-xs">{method.detail}</span>
                </span>
                <span className="text-sm font-medium tabular-nums">
                  {method.surcharge === 0 ? '—' : `+${formatCurrency(method.surcharge)}`}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <Button type="submit" size="lg" isFullWidth>
        Continue to payment
      </Button>
    </form>
  );
}
