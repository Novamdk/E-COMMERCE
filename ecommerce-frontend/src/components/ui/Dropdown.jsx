import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { FiCheck, FiChevronDown } from 'react-icons/fi';
import { cn } from '@/lib/cn';
import { MENU_ITEM_MOTION, MENU_MOTION } from '@/lib/motion';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

/**
 * An animated listbox that replaces a native <select>.
 *
 * Native selects cannot be animated or styled, so this is a real ARIA
 * listbox: roving `aria-activedescendant`, arrow/Home/End/Enter/Escape
 * handling, click-outside, and focus returned to the trigger on close.
 *
 * @param {object} props
 * @param {{value: string, label: string}[]} props.options
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 * @param {string} props.label accessible name for the trigger
 * @param {'start'|'end'} [props.align] which edge the menu hangs from
 * @param {string} [props.triggerClassName]
 */
export function Dropdown({ options, value, onChange, label, align = 'end', triggerClassName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const baseId = useId();

  const selected = options.find((option) => option.value === value) ?? options[0];
  const optionId = (index) => `${baseId}-option-${index}`;

  const close = useCallback((shouldRefocus) => {
    setIsOpen(false);
    if (shouldRefocus) triggerRef.current?.focus();
  }, []);

  const open = useCallback(() => {
    // Seed the highlight from the current value instead of syncing it in an effect.
    const index = options.findIndex((option) => option.value === value);
    setActiveIndex(index < 0 ? 0 : index);
    setIsOpen(true);
  }, [options, value]);

  useOnClickOutside(wrapperRef, () => setIsOpen(false), isOpen);

  // Move real focus into the list so keystrokes land there, and keep the
  // highlighted option in view. Both are DOM effects, not state updates.
  useEffect(() => {
    if (!isOpen) return;
    listRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [isOpen, activeIndex]);

  const select = (index) => {
    onChange(options[index].value);
    close(true);
  };

  const handleListKeyDown = (event) => {
    const last = options.length - 1;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((i) => (i >= last ? 0 : i + 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((i) => (i <= 0 ? last : i - 1));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(last);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        select(activeIndex);
        break;
      case 'Escape':
        event.preventDefault();
        close(true);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleTriggerKeyDown = (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    open();
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? close(false) : open())}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${label}: ${selected?.label}`}
        className={cn(
          'rounded-field bg-surface-raised flex h-11 w-full items-center justify-between gap-2 border px-3.5',
          'text-content text-[0.9375rem] transition-colors duration-200',
          isOpen ? 'border-brand-600' : 'border-border hover:border-border-strong',
          triggerClassName,
        )}
      >
        <span className="truncate">{selected?.label}</span>
        <m.span
          aria-hidden="true"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          className="text-content-muted"
        >
          <FiChevronDown className="size-4" />
        </m.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <m.ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            aria-activedescendant={optionId(activeIndex)}
            onKeyDown={handleListKeyDown}
            data-lenis-prevent
            // Named variant states, not spread objects: that is what lets
            // staggerChildren reach the <li> items below.
            variants={MENU_MOTION}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ transformOrigin: 'top center' }}
            className={cn(
              'absolute top-full z-40 mt-2 max-h-72 min-w-full overflow-y-auto overscroll-contain',
              'rounded-card border-border bg-surface-raised shadow-lifted border p-1.5 outline-none',
              align === 'end' ? 'right-0' : 'left-0',
            )}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;

              return (
                <m.li
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isSelected}
                  data-active={isActive}
                  variants={MENU_ITEM_MOTION}
                  onClick={() => select(index)}
                  onPointerEnter={() => setActiveIndex(index)}
                  className={cn(
                    'rounded-field flex cursor-pointer items-center justify-between gap-3 px-3 py-2.5 text-sm whitespace-nowrap transition-colors',
                    isActive ? 'bg-surface-brand text-brand-700' : 'text-content-muted',
                    isSelected && 'text-content font-medium',
                  )}
                >
                  {option.label}
                  {isSelected && <FiCheck aria-hidden="true" className="text-brand-700 size-4" />}
                </m.li>
              );
            })}
          </m.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
