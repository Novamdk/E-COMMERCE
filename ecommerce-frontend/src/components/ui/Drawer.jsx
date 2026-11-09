import { FiX } from 'react-icons/fi';
import { cn } from '@/lib/cn';
import { EASE_IN_SOFT, EASE_OUT_SOFT } from '@/lib/motion';
import { Overlay } from './Overlay';

/** @param {string} from the off-screen x offset */
const slide = (from) => ({
  initial: { x: from },
  animate: { x: 0, transition: { duration: 0.44, ease: EASE_OUT_SOFT } },
  exit: { x: from, transition: { duration: 0.3, ease: EASE_IN_SOFT } },
});

const SIDES = {
  right: {
    container: 'justify-end',
    panel: 'h-full w-full max-w-[26.5rem]',
    motion: slide('100%'),
  },
  left: {
    container: 'justify-start',
    panel: 'h-full w-full max-w-[22rem]',
    motion: slide('-100%'),
  },
};

/**
 * Edge-anchored dialog. Header and footer stay fixed while the body scrolls,
 * so a long cart never pushes the checkout button out of reach.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {string} props.title
 * @param {string} props.titleId
 * @param {'left'|'right'} [props.side]
 * @param {import('react').ReactNode} [props.footer]
 * @param {import('react').ReactNode} [props.heading] shown in place of the title text (e.g. a
 *   logo); `title` still names the dialog for screen readers
 * @param {string} [props.panelClassName] replaces the side's default panel size
 * @param {string} [props.headerClassName] border colour for the header bar (default border-border)
 */
export function Drawer({
  isOpen,
  onClose,
  title,
  titleId,
  side = 'right',
  footer,
  heading,
  panelClassName,
  headerClassName,
  children,
}) {
  const config = SIDES[side] ?? SIDES.right;

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      titleId={titleId}
      containerClassName={config.container}
      panelClassName={panelClassName ?? config.panel}
      panelMotion={config.motion}
    >
      <header
        className={cn(
          'flex items-center justify-between gap-4 border-b px-5 py-4',
          headerClassName ?? 'border-border',
        )}
      >
        {heading ? (
          <div>
            <h2 id={titleId} className="sr-only">
              {title}
            </h2>
            {heading}
          </div>
        ) : (
          <h2 id={titleId} className="font-display text-xl">
            {title}
          </h2>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title.toLowerCase()}`}
          className="rounded-field text-content-muted hover:bg-ink-100 hover:text-content grid size-9 place-items-center transition-colors"
        >
          <FiX className="size-5" />
        </button>
      </header>

      {/* data-lenis-prevent: without it Lenis swallows the wheel events here
          for the page scroll and this panel cannot be scrolled at all. */}
      <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {children}
      </div>

      {footer && (
        <footer className="border-border bg-surface-raised border-t px-5 py-4">{footer}</footer>
      )}
    </Overlay>
  );
}
