import { useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAsync } from '@/hooks/useAsync';
import { RouteFallback } from '@/components/layout/RouteFallback';
import { getProducts } from '@/services/productService';
import { useT } from '@/features/i18n';
import { isQuiz, QuizFlow, QUIZZES } from '@/features/quiz';
import NotFoundPage from './NotFoundPage';

/**
 * The hair quiz or the gift finder. Answers already in the query string
 * (from the homepage swatches) are taken as given.
 */
export default function QuizPage() {
  const { quizId } = useParams();
  const [searchParams] = useSearchParams();
  const { language } = useT();
  const fetchProducts = useCallback(() => getProducts(language), [language]);
  const { data } = useAsync(fetchProducts);

  if (!isQuiz(quizId)) return <NotFoundPage />;
  if (!data) return <RouteFallback />;

  const quiz = QUIZZES[quizId];
  const initialAnswers = Object.fromEntries(
    quiz.steps
      .map((step) => [step.id, searchParams.get(step.id)])
      .filter(([id, value]) =>
        quiz.steps.find((step) => step.id === id).options.some((option) => option.value === value),
      ),
  );

  return <QuizFlow key={quizId} quiz={quiz} products={data} initialAnswers={initialAnswers} />;
}
