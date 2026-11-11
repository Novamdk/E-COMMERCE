import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLenis } from 'lenis/react';
import { FiCheck } from 'react-icons/fi';
import { Checkbox } from '@/components/ui/Checkbox';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/layout/PageShell';
import { useHydrated } from '@/hooks/useHydrated';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ROUTES } from '@/lib/constants';
import { POLICIES, POLICY_UPDATED, policyBySlug, sectionId } from '@/data/policies';
import { hasAdOptOut, hasGlobalPrivacyControl, setAdOptOut } from '@/lib/adTags';

/**
 * "Your privacy choices": the switch for Meta, TikTok and Google tags. Saved
 * in this browser; Global Privacy Control turns it off and cannot be undone
 * here, since the browser's own signal wins.
 */
function AdChoices() {
  // The page is prerendered, so read browser settings only after hydration.
  const isHydrated = useHydrated();
  const isGpc = isHydrated && hasGlobalPrivacyControl();
  const [choice, setChoice] = useState(null);
  const isOptedOut = choice ?? (isHydrated && hasAdOptOut());

  return (
    <div className="rounded-panel border-border bg-surface-raised mt-2 space-y-3 border p-5">
      <h3 className="font-medium">Your privacy choices</h3>
      <Checkbox
        id="ad-opt-out"
        label="Do not sell or share my personal information (turn off advertising tags in this browser)"
        checked={isOptedOut}
        disabled={isGpc}
        onChange={(event) => {
          setChoice(event.target.checked);
          setAdOptOut(event.target.checked);
        }}
      />
      <p className="text-content-subtle text-sm" role="status">
        {isGpc
          ? 'Your browser sends Global Privacy Control, so advertising tags are already off.'
          : isOptedOut
            ? 'Advertising tags are off in this browser.'
            : 'Advertising tags are on. Tick the box to turn them off.'}
      </p>
    </div>
  );
}

/** Scrolls to #section once the page has rendered, e.g. from the footer link. */
function useScrollToHash() {
  const { hash } = useLocation();
  const lenis = useLenis();
  useEffect(() => {
    if (!hash) return undefined;
    const timer = window.setTimeout(() => {
      const target = document.getElementById(hash.slice(1));
      if (!target) return;
      if (lenis) lenis.scrollTo(target, { offset: -96 });
      else target.scrollIntoView();
    }, 400);
    return () => window.clearTimeout(timer);
  }, [hash, lenis]);
}

/**
 * Shipping, returns, privacy, terms and accessibility. One component for all five: the text
 * lives in src/data/policies.js so the prerendered HTML says the same thing.
 * Policies stay in English in every language, as the binding version.
 *
 * @param {{ slug: 'shipping' | 'returns' | 'privacy' | 'terms' | 'accessibility' }} props
 */
export default function PolicyPage({ slug }) {
  const policy = policyBySlug(slug);
  useScrollToHash();
  usePageMeta({ title: policy.title, description: policy.description, path: policy.path });

  return (
    <PageShell width="narrow">
      <PageHeader
        title={policy.title}
        description={policy.intro}
        breadcrumbs={[{ label: 'Home', to: ROUTES.HOME }, { label: policy.title }]}
      />
      <p className="text-content-subtle mt-4 text-sm">Last updated {POLICY_UPDATED}</p>

      {policy.summary?.length > 0 && (
        <aside
          aria-labelledby="policy-summary"
          className="rounded-panel border-border bg-surface-raised mt-8 border p-6"
        >
          <h2 id="policy-summary" className="text-sm font-semibold tracking-[0.12em] uppercase">
            At a glance
          </h2>
          <ul className="mt-4 space-y-2.5">
            {policy.summary.map((item) => (
              <li key={item} className="flex gap-3 leading-relaxed">
                <FiCheck aria-hidden="true" className="text-brand-700 mt-1 size-4 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </aside>
      )}

      <div className="mt-12 space-y-10">
        {policy.sections.map((section) => (
          <section
            key={section.heading}
            id={sectionId(section)}
            className="border-border scroll-mt-24 space-y-3 border-t pt-8 first:border-t-0 first:pt-0"
          >
            <h2 className="font-display text-2xl">{section.heading}</h2>
            {section.blocks.map((block, index) =>
              typeof block === 'string' ? (
                <p key={index} className="text-content-muted leading-relaxed">
                  {block}
                </p>
              ) : block.subheading ? (
                <h3 key={index} className="pt-2 font-semibold">
                  {block.subheading}
                </h3>
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
            {section.hasAdChoices && <AdChoices />}
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
