import { useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import { Container } from '@/components/layout/Container';
import { COLLAPSE_MOTION, EASE_OUT_SOFT } from '@/lib/motion';

/**
 * FAQ accordion. One panel open at a time, animated open and closed — CSS
 * cannot transition to `height: auto`, which is why this is motion-driven
 * rather than a <details> element.
 *
 * @param {object} props
 * @param {{q: string, a: string}[]} props.faq
 */
export function FaqSection({ faq }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <Container as="section" aria-labelledby="faq-heading" width="narrow" className="py-20">
      <h2 id="faq-heading" className="font-display text-display-sm sm:text-display">
        Have questions?
      </h2>

      <div className="divide-border border-border mt-10 divide-y border-y">
        {faq.map((item, index) => {
          const isOpen = openIndex === index;
          const panelId = `faq-panel-${index}`;
          const buttonId = `faq-trigger-${index}`;

          return (
            <div key={item.q}>
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="hover:text-brand-700 flex w-full items-center justify-between gap-6 py-5 text-left font-medium transition-colors"
                >
                  {item.q}
                  <m.span
                    aria-hidden="true"
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: EASE_OUT_SOFT }}
                    className="text-content-muted shrink-0"
                  >
                    <FiPlus className="size-4" />
                  </m.span>
                </button>
              </h3>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <m.div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    {...COLLAPSE_MOTION}
                    className="overflow-hidden"
                  >
                    <p className="text-content-muted pb-5 text-sm leading-relaxed">{item.a}</p>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </Container>
  );
}
