import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

/**
 * The one heading treatment for homepage sections: a small uppercase
 * eyebrow, a serif title, and an optional underlined text link. Centred by
 * default; every section uses it so spacing and type never drift.
 *
 * @param {object} props
 * @param {string} props.id heading id, for the section's aria-labelledby
 * @param {string} props.title
 * @param {string} [props.eyebrow]
 * @param {{to: string, label: string}} [props.link]
 * @param {boolean} [props.isInverse] light text for dark surfaces
 */
export function SectionHeader({ id, title, eyebrow, link, isInverse = false, className }) {
  return (
    <div className={cn('mb-10 text-center sm:mb-12', className)}>
      {eyebrow && (
        <p
          className={cn(
            'mb-3 text-[0.6875rem] font-semibold tracking-[0.18em] uppercase',
            isInverse ? 'text-gold-300' : 'text-gold-600',
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2 id={id} className="font-display text-display-sm sm:text-display">
        {title}
      </h2>
      {link && (
        <Link
          to={link.to}
          className="mt-4 inline-block text-[0.6875rem] font-semibold tracking-[0.16em] uppercase underline underline-offset-[6px] transition-opacity hover:opacity-60"
        >
          {link.label}
        </Link>
      )}
    </div>
  );
}
