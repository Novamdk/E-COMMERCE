import { useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { FiChevronLeft } from 'react-icons/fi';
import { Image } from '@/components/ui/Image';
import { cn } from '@/lib/cn';
import { EASE_OUT_SOFT } from '@/lib/motion';
import { useT } from '@/features/i18n';
import { QuizResults } from './QuizResults';
import { QuizUnlock } from './QuizUnlock';

const STEP_MOTION = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.36, ease: EASE_OUT_SOFT } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.18 } },
};

/** Image beside the sign-up step. */
const UNLOCK_IMAGE = 'welcome-gift';

/**
 * One question per screen, the way a stylist would ask: progress dots, the
 * question, big tap targets, an optional pro tip, and a back link. A photo
 * fills the right half from md up. After the last question comes the
 * "unlock 15% off + free shipping" sign-up (skippable), then the results.
 *
 * @param {object} props
 * @param {object} props.quiz a definition from QUIZZES
 * @param {object[]} props.products the catalog, for the results
 * @param {Record<string, string>} [props.initialAnswers] answers picked before
 *   landing, e.g. the hair type tapped on the homepage teaser; the quiz starts
 *   at the first step still unanswered
 */
export function QuizFlow({ quiz, products, initialAnswers = {} }) {
  const { t } = useT();
  const [answers, setAnswers] = useState(initialAnswers);
  const [stepIndex, setStepIndex] = useState(() => {
    const firstOpen = quiz.steps.findIndex((step) => !initialAnswers[step.id]);
    return firstOpen === -1 ? 0 : firstOpen;
  });
  const [hasUnlocked, setHasUnlocked] = useState(false);

  const questionCount = quiz.steps.length;
  const isUnlockStep = stepIndex === questionCount;
  const isResults = stepIndex > questionCount;
  const step = quiz.steps[stepIndex];

  if (isResults) {
    return (
      <QuizResults
        quiz={quiz}
        answers={answers}
        products={products}
        hasUnlocked={hasUnlocked}
        onUnlock={() => setHasUnlocked(true)}
        onRestart={() => {
          setAnswers({});
          setHasUnlocked(false);
          setStepIndex(0);
        }}
      />
    );
  }

  const choose = (value) => {
    setAnswers((current) => ({ ...current, [step.id]: value }));
    setStepIndex((index) => index + 1);
  };

  const hasSwatches = step?.options.some((option) => option.image);

  return (
    <section
      aria-labelledby="quiz-question"
      className="grid min-h-[calc(100dvh-7.5rem)] md:grid-cols-2"
    >
      <div className="flex flex-col px-4 py-10 sm:px-10 lg:px-16 lg:py-16">
        <ol className="flex gap-2.5" aria-label={t('quiz.progress')}>
          {Array.from({ length: questionCount + 1 }, (_, index) => (
            <li
              key={index}
              aria-current={index === stepIndex ? 'step' : undefined}
              className={cn(
                'size-1.5 rounded-full transition-colors',
                index <= stepIndex ? 'bg-content' : 'bg-ink-200',
              )}
            >
              <span className="sr-only">
                {t('quiz.stepOf', { index: index + 1, total: questionCount + 1 })}
              </span>
            </li>
          ))}
        </ol>

        <AnimatePresence mode="wait" initial={false}>
          <m.div key={stepIndex} {...STEP_MOTION} className="mt-10 flex-1">
            {isUnlockStep ? (
              <QuizUnlock
                onDone={(didUnlock) => {
                  setHasUnlocked(didUnlock);
                  setStepIndex(questionCount + 1);
                }}
              />
            ) : (
              <>
                <h1
                  id="quiz-question"
                  className="font-display text-display-sm sm:text-display max-w-lg"
                >
                  {t(step.question)}
                </h1>

                <ul
                  className={cn(
                    'mt-8 grid max-w-xl gap-3',
                    hasSwatches ? 'grid-cols-2 sm:grid-cols-4' : 'sm:grid-cols-2',
                  )}
                >
                  {step.options.map((option) => (
                    <li key={option.value}>
                      <button
                        type="button"
                        onClick={() => choose(option.value)}
                        aria-pressed={answers[step.id] === option.value}
                        className={cn(
                          'group hover:border-content aria-pressed:border-content aria-pressed:bg-surface-sunken w-full border transition-colors',
                          'border-border-strong text-left text-sm font-medium',
                          option.image
                            ? 'flex flex-col items-center gap-3 rounded-none p-4 text-center'
                            : 'flex min-h-16 items-center gap-4 px-4 py-3',
                        )}
                      >
                        {option.image && (
                          <Image
                            name={option.image}
                            alt=""
                            sizes="96px"
                            ratio="aspect-square"
                            className="w-20 rounded-full"
                          />
                        )}
                        {option.lines && (
                          <span aria-hidden="true" className="flex gap-0.5">
                            {Array.from({ length: option.lines * 2 }, (_, i) => (
                              <span
                                key={i}
                                className={cn(
                                  'bg-content h-5 rounded-full',
                                  option.lines === 1 ? 'w-px' : 'w-0.5',
                                )}
                              />
                            ))}
                          </span>
                        )}
                        {t(option.label)}
                      </button>
                    </li>
                  ))}
                </ul>

                {step.tip && (
                  <div className="mt-10 max-w-sm">
                    <p className="text-[0.6875rem] font-bold tracking-[0.14em] uppercase">
                      {t('quiz.proTip')}
                    </p>
                    <p className="mt-2 text-sm font-semibold">{t(step.tip.title)}</p>
                    <p className="text-content-muted mt-1 text-sm leading-relaxed">
                      {t(step.tip.body)}
                    </p>
                  </div>
                )}
              </>
            )}
          </m.div>
        </AnimatePresence>

        {stepIndex > 0 && (
          <button
            type="button"
            onClick={() => setStepIndex((index) => index - 1)}
            className="mt-10 inline-flex items-center gap-1 self-start text-[0.6875rem] font-semibold tracking-[0.14em] uppercase underline-offset-4 hover:underline"
          >
            <FiChevronLeft aria-hidden="true" className="size-4" />
            {t('quiz.back')}
          </button>
        )}
      </div>

      <div className="relative hidden md:block">
        <div className="absolute inset-0">
          <Image
            name={isUnlockStep ? UNLOCK_IMAGE : step.image}
            alt=""
            sizes="50vw"
            priority
            className="size-full"
          />
        </div>
      </div>
    </section>
  );
}
