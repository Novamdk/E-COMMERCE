import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/layout/PageShell';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ROUTES } from '@/lib/constants';
import { POLICIES, POLICY_UPDATED, policyBySlug } from '@/data/policies';

/**
 * Shipping, returns, privacy and terms. One component for all four: the text
 * lives in src/data/policies.js so the prerendered HTML says the same thing.
 * Policies stay in English in every language, as the binding version.
 *
 * @param {{ slug: 'shipping' | 'returns' | 'privacy' | 'terms' }} props
 */
export default function PolicyPage({ slug }) {
  const policy = policyBySlug(slug);
  usePageMeta({ title: policy.title, description: policy.description, path: policy.path });

  return (
    <PageShell width="narrow">
      <PageHeader
        title={policy.title}
        description={policy.intro}
        breadcrumbs={[{ label: 'Home', to: ROUTES.HOME }, { label: policy.title }]}
      />
      <p className="text-content-subtle mt-4 text-sm">Last updated {POLICY_UPDATED}</p>

      <div className="mt-10 space-y-10">
        {policy.sections.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h2 className="font-display text-2xl">{section.heading}</h2>
            {section.blocks.map((block, index) =>
              typeof block === 'string' ? (
                <p key={index} className="text-content-muted leading-relaxed">
                  {block}
                </p>
              ) : (
                <ul
                  key={index}
                  className="text-content-muted list-disc space-y-2 pl-5 leading-relaxed"
                >
                  {block.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ),
            )}
          </section>
        ))}
      </div>

      <nav aria-label="Store policies" className="border-border mt-14 border-t pt-8">
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {POLICIES.filter((other) => other.slug !== slug).map((other) => (
            <li key={other.slug}>
              <Link to={other.path} className="text-content-muted hover:text-content underline">
                {other.title}
              </Link>
            </li>
          ))}
          <li>
            <Link to={ROUTES.CONTACT} className="text-content-muted hover:text-content underline">
              Contact us
            </Link>
          </li>
        </ul>
      </nav>
    </PageShell>
  );
}
