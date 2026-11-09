import { useCallback, useMemo, useState } from 'react';
import { validateAll } from '@/lib/validators';

/**
 * Per-field validation with inline errors, shared by the auth forms and every
 * checkout step.
 *
 * Errors surface once a field has been blurred or a submit has been attempted,
 * so a pristine form is never shouting at someone who has not typed yet, and
 * submit is blocked while anything is invalid.
 *
 * @param {object} config
 * @param {Record<string, any>} config.initialValues
 * @param {Record<string, (value: any, values: object) => string|null>} config.schema
 * @param {(values: object) => void|Promise<void>} [config.onSubmit]
 */
export function useForm({ initialValues, schema, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allErrors = useMemo(() => validateAll(values, schema), [values, schema]);
  const isValid = Object.keys(allErrors).length === 0;

  /** Only the errors the user should currently see. */
  const visibleErrors = useMemo(() => {
    if (hasSubmitted) return allErrors;
    return Object.fromEntries(Object.entries(allErrors).filter(([field]) => touched[field]));
  }, [allErrors, touched, hasSubmitted]);

  const setValue = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setManyValues = useCallback((patch) => {
    setValues((prev) => ({ ...prev, ...patch }));
  }, []);

  const blurField = useCallback((field) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }, []);

  /**
   * Everything a controlled input needs, including its error wiring.
   * @param {string} field
   */
  const getFieldProps = useCallback(
    (field) => ({
      id: field,
      name: field,
      value: values[field] ?? '',
      onChange: (event) => setValue(field, event.target.value),
      onBlur: () => blurField(field),
      'aria-describedby': visibleErrors[field] ? `${field}-error` : undefined,
    }),
    [values, visibleErrors, setValue, blurField],
  );

  /**
   * @param {import('react').FormEvent} [event]
   * @returns {Promise<boolean>} whether the submit ran
   */
  const handleSubmit = useCallback(
    async (event) => {
      event?.preventDefault();
      setHasSubmitted(true);

      if (!isValid) {
        // Move focus to the first offender so keyboard users land on it.
        const firstField = Object.keys(validateAll(values, schema))[0];
        document.getElementById(firstField)?.focus();
        return false;
      }

      setIsSubmitting(true);
      try {
        await onSubmit?.(values);
        return true;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isValid, values, schema, onSubmit],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setTouched({});
    setHasSubmitted(false);
    // initialValues is a literal at most call sites; resetting to the value
    // captured at mount is the intended behaviour.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    values,
    errors: visibleErrors,
    isValid,
    isSubmitting,
    hasSubmitted,
    setValue,
    setManyValues,
    blurField,
    getFieldProps,
    handleSubmit,
    reset,
  };
}
