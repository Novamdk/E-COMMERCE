import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiChevronLeft } from 'react-icons/fi';
import { useAsync } from '@/hooks/useAsync';
import { Image } from '@/components/ui/Image';
import { Container } from '@/components/layout/Container';
import { ROUTES } from '@/lib/constants';
import { getProducts } from '@/services/productService';
import { ProductGrid } from '@/features/catalog';
import { useT } from '@/features/i18n';
import { findPost, localizePost } from '@/features/journal';
import NotFoundPage from './NotFoundPage';

export default function JournalPostPage() {
  const { slug } = useParams();
  const { t, language } = useT();
  const fetchProducts = useCallback(() => getProducts(language), [language]);
  const { data } = useAsync(fetchProducts);

  const found = findPost(slug);
  if (!found) return <NotFoundPage />;

  const post = localizePost(found, language);
  const date = new Intl.DateTimeFormat(language, { dateStyle: 'long' }).format(
    new Date(`${post.date}T12:00:00`),
  );
  const byId = new Map((data ?? []).map((product) => [product.id, product]));
  const products = post.products.map((id) => byId.get(id)).filter(Boolean);

  return (
    <article>
      <Container width="narrow" className="pt-10 lg:pt-14">
        <Link
          to={ROUTES.JOURNAL}
          className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase hover:underline hover:underline-offset-4"
        >
          <FiChevronLeft aria-hidden="true" className="size-4" />
          {t('journal.title')}
        </Link>
        <p className="text-content-subtle mt-8 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase">
          <time dateTime={post.date}>{date}</time> ·{' '}
          {t('journal.readTime', { minutes: post.readMinutes })}
        </p>
        <h1 className="font-display text-display sm:text-display-lg mt-3">{post.title}</h1>
        <p className="text-content-muted mt-4 text-lg leading-relaxed">{post.excerpt}</p>
      </Container>

      <Container width="wide" className="mt-10">
        <Image name={post.image} alt="" sizes="100vw" ratio="aspect-[16/9]" priority />
      </Container>

      <Container width="narrow" className="py-12">
        {post.sections.map((section) => (
          <section key={section.heading} className="mt-10 first:mt-0">
            <h2 className="font-display text-2xl">{section.heading}</h2>
            <p className="text-content-muted mt-3 leading-relaxed">{section.body}</p>
          </section>
        ))}
      </Container>

      {products.length > 0 && (
        <Container width="wide" as="section" aria-labelledby="post-products" className="pb-20">
          <h2 id="post-products" className="font-display text-display-sm mb-8">
            {t('journal.shopPost')}
          </h2>
          <ProductGrid products={products} columns={3} />
        </Container>
      )}
    </article>
  );
}
