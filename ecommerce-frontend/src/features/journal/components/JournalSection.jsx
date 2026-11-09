import { Container } from '@/components/layout/Container';
import { ROUTES } from '@/lib/constants';
import { useT } from '@/features/i18n';
import { SectionHeader } from '@/features/marketing';
import { localizePost, POSTS } from '../posts';
import { PostCard } from './PostCard';

/** The latest journal posts, two across, for the homepage. */
export function JournalSection() {
  const { t, language } = useT();

  return (
    <Container
      as="section"
      width="wide"
      aria-labelledby="journal-heading"
      className="py-20 lg:py-24"
    >
      <SectionHeader
        id="journal-heading"
        eyebrow={t('journal.eyebrow')}
        title={t('journal.title')}
        link={{ to: ROUTES.JOURNAL, label: t('journal.all') }}
      />
      <div className="grid gap-12 md:grid-cols-2 md:gap-6">
        {POSTS.slice(0, 2).map((post) => (
          <PostCard key={post.slug} post={localizePost(post, language)} />
        ))}
      </div>
    </Container>
  );
}
