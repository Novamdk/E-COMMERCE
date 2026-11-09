import { cn } from '@/lib/cn';

/**
 * Radio group rendered as chips. A real fieldset with radio inputs, so arrow
 * keys move between options and the legend names the group.
 *
 * @param {object} props
 * @param {string} props.name
 * @param {string} props.label
 * @param {string[]} props.options
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 * @param {string|null} [props.error]
 */
export function VariantPicker({ name, label, options, value, onChange, error }) {
  if (options.length === 0) return null;

  return (
    <fieldset>
      <legend className="mb-2.5 flex items-baseline gap-2 text-sm font-medium">
        {label}
        {value && <span className="text-content-muted">· {value}</span>}
      </legend>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const id = `${name}-${option.replace(/\s+/g, '-').toLowerCase()}`;
          const isSelected = value === option;

          return (
            <label
              key={option}
              htmlFor={id}
              className={cn(
                'rounded-field cursor-pointer border px-3.5 py-2 text-sm transition-colors',
                'has-focus-visible:outline-focus has-focus-visible:outline-2 has-focus-visible:outline-offset-2',
                isSelected
                  ? 'border-brand-700 bg-surface-brand text-brand-700 font-medium'
                  : 'border-border text-content-muted hover:border-border-strong hover:text-content',
              )}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={option}
                checked={isSelected}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              {option}
            </label>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="text-danger-600 mt-2 text-xs font-medium">
          {error}
        </p>
      )}
    </fieldset>
  );
}
