/**
 * Shared motion vocabulary. Keeping easings and durations in one place is what
 * stops the drawer, the dropdown and the page transitions from each inventing
 * their own timing and feeling like three different products.
 *
 * The curves mirror --ease-out-soft in the stylesheet, so CSS transitions and
 * Framer Motion animations move the same way.
 */

/** Decelerating, no overshoot — things arriving. */
export const EASE_OUT_SOFT = [0.22, 1, 0.36, 1];
/** Accelerating — things leaving. Exits are quicker than entrances. */
export const EASE_IN_SOFT = [0.4, 0, 1, 1];

export const DURATION = {
  fast: 0.18,
  base: 0.26,
  slow: 0.44,
};

/** Backdrop fade shared by every overlay. */
export const BACKDROP_MOTION = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.32, ease: EASE_OUT_SOFT } },
  exit: { opacity: 0, transition: { duration: 0.24, ease: EASE_IN_SOFT } },
};

/** A menu or listbox dropping from its trigger, with its items staggered in. */
export const MENU_MOTION = {
  initial: { opacity: 0, y: -8, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: DURATION.base,
      ease: EASE_OUT_SOFT,
      staggerChildren: 0.028,
      delayChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.97,
    transition: { duration: DURATION.fast, ease: EASE_IN_SOFT, staggerChildren: 0 },
  },
};

export const MENU_ITEM_MOTION = {
  initial: { opacity: 0, x: -6 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.22, ease: EASE_OUT_SOFT } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

/** Content settling into place on first paint — used for route sections. */
export const RISE_MOTION = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_SOFT } },
};

/**
 * Collapsible height animation for accordions.
 * `height: auto` is animatable by Framer Motion but not by CSS.
 */
export const COLLAPSE_MOTION = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.34, ease: EASE_OUT_SOFT },
      opacity: { duration: 0.26, delay: 0.06 },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.26, ease: EASE_IN_SOFT },
      opacity: { duration: 0.14 },
    },
  },
};
