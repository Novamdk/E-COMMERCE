import { useState } from 'react';
import { FiTag, FiX } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCart } from '../useCart';

/**
 * Promo code entry. Feedback is announced politely rather than shown as a
 * blocking error, since an unrecognised code is not a form failure.
 *
 * @param {object} props
 * @param {object|null} props.promo the applied promo, if any
 */
export function PromoForm({ promo }) {
  const { applyPromo, removePromo } = useCart();
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!code.trim()) return;
    const result = applyPromo(code);
    setFeedback(result);
    if (result.ok) setCode('');
  };

  if (promo) {
    return (
      <div className="rounded-field bg-success-50 flex items-center justify-between gap-3 px-3.5 py-2.5">
        <p className="text-success-600 flex items-center gap-2 text-sm font-medium">
          <FiTag aria-hidden="true" className="size-4" />
          {promo.code} — {promo.label}
        </p>
        <button
          type="button"
          onClick={() => {
            removePromo();
            setFeedback(null);
          }}
          aria-label={`Remove promo code ${promo.code}`}
          className="text-success-600 hover:bg-success-600/10 grid size-7 place-items-center rounded-full transition-colors"
        >
          <FiX className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label htmlFor="promo-code" className="text-sm font-medium">
        Promo code
      </label>
      <div className="flex gap-2">
        <Input
          id="promo-code"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="SKGLOW10"
          autoComplete="off"
          aria-describedby="promo-feedback"
          className="flex-1 uppercase"
        />
        <Button type="submit" variant="secondary" disabled={!code.trim()}>
          Apply
        </Button>
      </div>
      <p
        id="promo-feedback"
        aria-live="polite"
        className={
          feedback?.ok === false ? 'text-danger-600 text-xs' : 'text-content-subtle text-xs'
        }
      >
        {feedback ? feedback.message : 'Try SKGLOW10 for 10% off.'}
      </p>
    </form>
  );
}
