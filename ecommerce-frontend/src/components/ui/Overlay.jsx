import { useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m } from 'framer-motion';
import { cn } from '@/lib/cn';
import { BACKDROP_MOTION } from '@/lib/motion';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { useScrollLock } from '@/hooks/useScrollLock';

/**
 * Shared scaffolding for every modal surface: portal, animated backdrop,
 * scroll lock, focus trap, Escape and click-outside. Drawer and Modal differ
 * only in how their panel is positioned and how it animates, which keeps the
 * accessibility behaviour identical across both.
 *
 * AnimatePresence keeps the panel mounted through its exit transition, so
 * there is no hand-rolled mount/unmount timing to keep in sync with the CSS.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {string} props.titleId id of the heading that names the dialog
 * @param {string} props.containerClassName flex alignment of the panel
 * @param {string} props.panelClassName size and shape of the panel
 * @param {object} props.panelMotion initial/animate/exit for the panel
 */
export function Overlay({
  isOpen,
  onClose,
  titleId,
  containerClassName,
  panelClassName,
  panelMotion,
  children,
}) {
  const panelRef = useRef(null);

  // Stable, so the focus trap does not resubscribe on every parent render.
  const handleClose = useCallback(() => onClose(), [onClose]);

  useScrollLock(isOpen);
  useFocusTrap(panelRef, { active: isOpen, onEscape: handleClose });
  useOnClickOutside(panelRef, handleClose, isOpen);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className={cn('fixed inset-0 z-50 flex', containerClassName)}>
          <m.div
            aria-hidden="true"
            {...BACKDROP_MOTION}
            className="bg-surface-inverse/45 absolute inset-0 backdrop-blur-[2px]"
          />

          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            {...panelMotion}
            className={cn('bg-surface shadow-overlay relative flex flex-col', panelClassName)}
          >
            {children}
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
