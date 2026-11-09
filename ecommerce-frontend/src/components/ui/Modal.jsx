import { FiX } from 'react-icons/fi';
import { cn } from '@/lib/cn';
import { EASE_IN_SOFT, EASE_OUT_SOFT } from '@/lib/motion';
import { Overlay } from './Overlay';

const SIZES = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
};

/** Rises from the bottom on phones, scales in from centre on larger screens. */
const PANEL_MOTION = {
  initial: { opacity: 0, y: 28, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE_OUT_SOFT } },
  exit: { opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.24, ease: EASE_IN_SOFT } },
};

/**
 * Centred dialog. On narrow viewports it anchors to the bottom of the screen
 * instead, which keeps the content within thumb reach.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {string} props.title
 * @param {string} props.titleId
 * @param {'sm'|'md'|'lg'} [props.size]
 * @param {string} [props.description]
 */
export function Modal({ isOpen, onClose, title, titleId, size = 'md', description, children }) {
  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      titleId={titleId}
      containerClassName="items-end justify-center sm:items-center sm:p-4"
      panelClassName={cn(
        'max-h-[90dvh] w-full rounded-t-panel sm:rounded-panel',
        SIZES[size] ?? SIZES.md,
      )}
      panelMotion={PANEL_MOTION}
    >
      <div className="flex items-start justify-between gap-4 px-6 pt-6">
        <div className="space-y-1">
          <h2 id={titleId} className="font-display text-2xl">
            {title}
          </h2>
          {description && <p className="text-content-muted text-sm">{description}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title.toLowerCase()}`}
          className="rounded-field text-content-muted hover:bg-ink-100 hover:text-content -mt-1 grid size-9 shrink-0 place-items-center transition-colors"
        >
          <FiX className="size-5" />
        </button>
      </div>

      <div data-lenis-prevent className="min-h-0 overflow-y-auto overscroll-contain px-6 pt-4 pb-6">
        {children}
      </div>
    </Overlay>
  );
}
