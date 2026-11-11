import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/Image';
import { Button } from '@/components/ui/Button';
import { quizPath } from '@/lib/constants';
import { useT } from '@/features/i18n';
import { QUIZZES } from '../quizzes';

const HAIR_TYPES = QUIZZES.hair.steps[0];

/**
 * Homepage lead-in to the hair quiz: a photo on the left, and on the right
 * the quiz's first question with its hair-type swatches. Tapping a swatch
 * starts the quiz with that answer already in.
 */
export function QuizTeaser() {
  const { t } = useT();

  return (
    <section aria-labelledby="quiz-teaser" className="bg-surface-sunken grid md:grid-cols-2">
      <div className="relative min-h-80">
        <div className="absolute inset-0">
          <Image
            name="routine-hair"
            alt=""
            sizes="(min-width: 768px) 50vw, 100vw"
            className="size-full"
            imgClassName="object-[50%_30%]"
          />
        </div>
      </div>

      <div className="flex flex-col justify-center px-4 py-12 sm:px-10 lg:px-16 lg:py-20">
        <h2 id="quiz-teaser" className="font-display text-display-sm sm:text-display">
          {t('quiz.teaser.title')}
        </h2>
        <p className="text-content-muted mt-3 text-sm sm:text-base">{t('quiz.teaser.body')}</p>

        <p className="mt-10 text-[0.6875rem] font-bold tracking-[0.14em] uppercase">
          {t('quiz.teaser.step')}
        </p>
        <p className="mt-1 text-sm font-semibold">{t(HAIR_TYPES.question)}</p>

        <ul className="mt-5 grid max-w-md grid-cols-4 gap-3">
          {HAIR_TYPES.options.map((option) => (
            <li key={option.value}>
              <Link
                to={`${quizPath('hair')}?${HAIR_TYPES.id}=${option.value}`}
                className="group flex flex-col items-center gap-2 text-center text-xs font-medium"
              >
                <Image
                  name={option.image}
                  alt=""
                  sizes="96px"
                  ratio="aspect-square"
                  className="group-hover:ring-content w-full rounded-full ring-1 ring-transparent ring-offset-2 transition"
                />
                {t(option.label)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button to={quizPath('hair')} size="lg">
            {t('quiz.teaser.cta')}
          </Button>
          <Button to={quizPath('gift')} size="lg" variant="outline">
            {t('nav.giftFinder')}
          </Button>
        </div>
      </div>
    </section>
  );
}
