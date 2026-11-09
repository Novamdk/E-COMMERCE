import { FiAward, FiHeart, FiRefreshCw, FiTruck } from 'react-icons/fi';
import { Container } from '@/components/layout/Container';

const ICONS = [FiAward, FiHeart, FiTruck, FiRefreshCw];

/**
 * @param {object} props
 * @param {{title: string, body: string}[]} props.benefits
 */
export function BenefitsStrip({ benefits }) {
  return (
    <section aria-label="Why shop with us" className="border-border bg-surface-raised border-y">
      <Container className="py-10">
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <li key={benefit.title} className="flex gap-3.5">
                <span className="bg-surface-brand text-brand-700 grid size-10 shrink-0 place-items-center rounded-full">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{benefit.title}</h3>
                  <p className="text-content-muted mt-1 text-sm leading-relaxed">{benefit.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
