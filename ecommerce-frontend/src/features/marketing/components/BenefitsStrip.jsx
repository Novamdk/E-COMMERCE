import { FiAward, FiHeart, FiRefreshCw, FiTruck } from 'react-icons/fi';
import { Container } from '@/components/layout/Container';

const ICONS = [FiAward, FiHeart, FiTruck, FiRefreshCw];

/**
 * Quiet row of brand promises: an outline icon, an uppercase title and one
 * short line each.
 *
 * @param {object} props
 * @param {{title: string, body: string}[]} props.benefits
 */
export function BenefitsStrip({ benefits }) {
  return (
    <section aria-label="Why shop with us" className="border-border border-t">
      <Container width="wide" className="py-14">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <li key={benefit.title} className="flex flex-col items-center text-center">
                <Icon aria-hidden="true" className="size-5 stroke-[1.5]" />
                <h3 className="mt-4 text-[0.6875rem] font-semibold tracking-[0.16em] uppercase">
                  {benefit.title}
                </h3>
                <p className="text-content-muted mt-2 max-w-[15rem] text-sm leading-relaxed">
                  {benefit.body}
                </p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
