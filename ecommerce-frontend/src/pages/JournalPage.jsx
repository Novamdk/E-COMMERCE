import { Container } from '@/components/layout/Container';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useT } from '@/features/i18n';
import { localizePost, PostCard, POSTS } from '@/features/journal';

export default function JournalPage() {
  const { t, language } = useT();
  usePageMeta({ title: t('journal.title'), path: '/journal' });

  return (
    <Container width="wide" className="py-12 lg:py-16">
      <p className="text-gold-600 text-[0.6875rem] font-semibold tracking-[0.18em] uppercase">
        {t('journal.eyebrow')}
      </p>
      <h1 className="font-display text-display sm:text-display-lg mt-3">{t('journal.title')}</h1>

      <div className="mt-12 grid gap-12 md:grid-cols-2 md:gap-6">
        {POSTS.map((post) => (
          <PostCard key={post.slug} post={localizePost(post, language)} />
        ))}
      </div>
    </Container>
  );
}
