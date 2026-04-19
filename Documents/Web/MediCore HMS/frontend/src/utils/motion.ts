import { Variants, Transition } from 'motion/react';

// --- Transitions ---

export const transitions = {
  fast: { duration: 0.15 } as Transition,
  normal: { duration: 0.2 } as Transition,
  slow: { duration: 0.3 } as Transition,
  spring: { type: 'spring' as const, duration: 0.15, bounce: 0.1 } as Transition,
  springBouncy: { type: 'spring' as const, duration: 0.3, bounce: 0.2 } as Transition,
};

// --- Variants ---

export const pageEnter: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const cardMount: Variants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
};

export const modalOpen: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: transitions.spring },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: 'easeIn' } },
};

export const listItem: Variants = {
  initial: { opacity: 0, y: 4 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, delay: i * 0.03, ease: 'easeOut' },
  }),
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export const dropdown: Variants = {
  initial: { opacity: 0, scale: 0.95, y: -4 },
  animate: { opacity: 1, scale: 1, y: 0, transition: transitions.spring },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.1 } },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const slideIn: Variants = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, x: -8, transition: { duration: 0.15 } },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

// --- Stagger container ---

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// --- Skeleton to content swap ---

export const skeletonSwap = {
  skeleton: { opacity: 1 },
  content: { opacity: 1, transition: { duration: 0.3 } },
};
