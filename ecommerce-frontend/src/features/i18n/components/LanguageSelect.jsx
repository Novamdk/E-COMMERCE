import { useId } from 'react';
import { FiChevronDown, FiGlobe } from 'react-icons/fi';
import { cn } from '@/lib/cn';
import { LANGUAGES } from '../languages';
import { useT } from '../useT';

const TONES = {
  default: 'text-content',
  inverse: 'text-content-inverse',
};

/**
 * Globe + language picker. A native <select> on purpose: it is keyboard and
 * screen-reader friendly everywhere and opens the phone's own picker on
 * mobile, which beats any custom listbox for a control this small.
 *
 * @param {object} props
 * @param {'default'|'inverse'} [props.tone] inverse for dark surfaces
 * @param {string} [props.className]
 */
export function LanguageSelect({ tone = 'default', className }) {
  const { language, setLanguage, t } = useT();
  const id = useId();

  return (
    <div
      className={cn(
        'relative inline-flex items-center gap-1.5',
        TONES[tone] ?? TONES.default,
        className,
      )}
    >
      <FiGlobe aria-hidden="true" className="size-3.5 shrink-0" />
      <label htmlFor={id} className="sr-only">
        {t('language.label')}
      </label>
      <select
        id={id}
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        className="[field-sizing:content] cursor-pointer appearance-none bg-transparent py-1 pr-5 text-[0.6875rem] font-medium tracking-[0.1em] uppercase focus-visible:underline"
      >
        {LANGUAGES.map((option) => (
          <option key={option.id} value={option.id} lang={option.id} className="text-content">
            {option.label}
          </option>
        ))}
      </select>
      <FiChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-0 size-3.5 opacity-70"
      />
    </div>
  );
}
