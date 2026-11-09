import { useCallback, useMemo, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { SHIPPING_METHODS, STORAGE_KEYS } from '@/lib/constants';
import {
  cardCvc,
  cardExpiry,
  cardNumber,
  email as validateEmail,
  phone,
  postalCode,
  required,
  validateAll,
} from '@/lib/validators';

export const CHECKOUT_STEPS = ['shipping', 'payment', 'review'];

const SHIPPING_SCHEMA = {
  firstName: required('First name'),
  lastName: required('Last name'),
  email: validateEmail,
  phone,
  address1: required('Street address'),
  city: required('City'),
  state: required('State'),
  postalCode,
};

const PAYMENT_SCHEMA = {
  cardholder: required('Name on card'),
  cardNumber,
  cardExpiry,
  cardCvc,
};

const STEP_FIELDS = {
  shipping: Object.keys(SHIPPING_SCHEMA),
  payment: Object.keys(PAYMENT_SCHEMA),
  review: [],
};

const INITIAL_SHIPPING = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postalCode: '',
  shippingMethodId: SHIPPING_METHODS[0].id,
};

const INITIAL_PAYMENT = { cardholder: '', cardNumber: '', cardExpiry: '', cardCvc: '' };

/**
 * Owns the whole checkout form across all three steps.
 *
 * The shipping address is persisted so a refresh mid-checkout does not lose
 * it. Card fields are held in memory only — they survive moving between steps
 * because the layout stays mounted, but they are never written to storage,
 * which is not a habit worth building even in a demo.
 */
export function useCheckoutForm() {
  const [shipping, setShipping] = useLocalStorage(STORAGE_KEYS.CHECKOUT, INITIAL_SHIPPING);
  const [payment, setPayment] = useState(INITIAL_PAYMENT);
  const [touched, setTouched] = useState({});
  const [attemptedSteps, setAttemptedSteps] = useState({});

  const values = useMemo(() => ({ ...shipping, ...payment }), [shipping, payment]);

  const errors = useMemo(
    () => validateAll(values, { ...SHIPPING_SCHEMA, ...PAYMENT_SCHEMA }),
    [values],
  );

  const setValue = useCallback(
    (field, value) => {
      if (field in INITIAL_PAYMENT) setPayment((prev) => ({ ...prev, [field]: value }));
      else setShipping((prev) => ({ ...prev, [field]: value }));
    },
    [setShipping],
  );

  const blurField = useCallback((field) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }, []);

  /** @param {string} step @returns {boolean} */
  const isStepValid = useCallback(
    (step) => STEP_FIELDS[step].every((field) => !errors[field]),
    [errors],
  );

  /**
   * Errors for a step, hidden until the field is blurred or the step's
   * continue button has been pressed.
   * @param {string} step
   * @returns {Record<string, string>}
   */
  const errorsForStep = useCallback(
    (step) => {
      const visible = {};
      for (const field of STEP_FIELDS[step]) {
        if (errors[field] && (touched[field] || attemptedSteps[step])) {
          visible[field] = errors[field];
        }
      }
      return visible;
    },
    [errors, touched, attemptedSteps],
  );

  /**
   * Records a continue attempt. Returns false (and reveals errors) when the
   * step is incomplete, which is what blocks advancing.
   * @param {string} step
   * @returns {boolean}
   */
  const attemptStep = useCallback(
    (step) => {
      setAttemptedSteps((prev) => ({ ...prev, [step]: true }));
      if (isStepValid(step)) return true;

      const firstInvalid = STEP_FIELDS[step].find((field) => errors[field]);
      if (firstInvalid) document.getElementById(firstInvalid)?.focus();
      return false;
    },
    [isStepValid, errors],
  );

  /** Fields a control needs, pre-wired to this form. */
  const getFieldProps = useCallback(
    (field) => ({
      id: field,
      name: field,
      value: values[field] ?? '',
      onChange: (event) => setValue(field, event.target.value),
      onBlur: () => blurField(field),
    }),
    [values, setValue, blurField],
  );

  const resetAfterOrder = useCallback(() => {
    setShipping(INITIAL_SHIPPING);
    setPayment(INITIAL_PAYMENT);
    setTouched({});
    setAttemptedSteps({});
  }, [setShipping]);

  const isReviewReady = isStepValid('shipping') && isStepValid('payment');

  return {
    values,
    shipping,
    payment,
    shippingMethodId: shipping.shippingMethodId,
    getFieldProps,
    setValue,
    isStepValid,
    errorsForStep,
    attemptStep,
    isReviewReady,
    resetAfterOrder,
  };
}
