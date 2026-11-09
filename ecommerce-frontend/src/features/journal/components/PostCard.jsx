import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/Image';
import { journalPath } from '@/lib/constants';
import { useT } from '@/features/i18n';

/**
 * @param {object} props
 * @param {object} props.post a localized post
 */
export function PostCard({ post }) {
  const { t, language } = useT();
  const date = new Intl.DateTimeFormat(language, { dateStyle: 'long' }).format(
    new Date(`${post.date}T12:00:00`),
  );

  return (
    <article>
      <Link to={journalPath(post.slug)} className="group block">
        <Image
          name={post.image}
          alt=""
          sizes="(min-width: 768px) 50vw, 100vw"
          ratio="aspect-[4/3]"
          imgClassName="transition-transform duration-1000 ease-out-soft group-hover:scale-[1.03]"
        />
        <p className="text-content-subtle mt-5 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase">
          <time dateTime={post.date}>{date}</time> ·{' '}
          {t('journal.readTime', { minutes: post.readMinutes })}
        </p>
        <h3 className="font-display mt-2 text-2xl leading-snug group-hover:underline group-hover:underline-offset-4 sm:text-3xl">
          {post.title}
        </h3>
        <p className="text-content-muted mt-2 max-w-lg text-sm leading-relaxed">{post.excerpt}</p>
        <span className="mt-4 inline-block text-[0.6875rem] font-semibold tracking-[0.16em] uppercase underline underline-offset-[6px]">
          {t('journal.readMore')}
        </span>
      </Link>
    </article>
  );
}
