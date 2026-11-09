import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiMail } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAsync } from '@/hooks/useAsync';
import { categoryPath, ROUTES } from '@/lib/constants';
import { email as validateEmail } from '@/lib/validators';
import { getCategories } from '@/services/productService';
import { BrandMark } from './BrandMark';
import { Container } from './Container';

const COMPANY_LINKS = [
  { to: ROUTES.ABOUT, label: 'About us' },
  { to: ROUTES.CONTACT, label: 'Contact' },
  { to: ROUTES.SHOP, label: 'All products' },
  { to: ROUTES.ORDERS, label: 'Order history' },
];

const COLUMN_HEADING = 'mb-4 text-xs font-semibold tracking-[0.08em] text-content uppercase';
const COLUMN_LINK = 'text-sm text-content-muted transition-colors hover:text-content';

/** Newsletter capture. Validates locally; there is no list to post to. */
function NewsletterForm() {
  const [value, setValue] = useState('');
  const [state, setState] = useState({ status: 'idle', message: '' });

  const handleSubmit = (event) => {
    event.preventDefault();
    const error = validateEmail(value);
    if (error) {
      setState({ status: 'error', message: error });
      return;
    }
    setState({ status: 'done', message: 'Thanks — your 10% code is on its way.' });
    setValue('');
  };

  if (state.status === 'done') {
    return (
      <p className="rounded-field bg-success-50 text-success-600 flex items-center gap-2 px-3.5 py-3 text-sm">
        <FiCheck aria-hidden="true" className="size-4 shrink-0" />
        {state.message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-2">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address for the newsletter
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="newsletter-email"
          type="email"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="you@example.com"
          prefix={<FiMail className="size-4" />}
          hasError={state.status === 'error'}
          aria-describedby="newsletter-feedback"
          className="flex-1"
        />
        <Button type="submit">Get 10% off</Button>
      </div>
      <p
        id="newsletter-feedback"
        aria-live="polite"
        className={
          state.status === 'error' ? 'text-danger-600 text-xs' : 'text-content-subtle text-xs'
        }
      >
        {state.status === 'error' ? state.message : 'Occasional updates. Unsubscribe anytime.'}
      </p>
    </form>
  );
}

export function Footer() {
  const fetchCategories = useCallback(() => getCategories(), []);
  const { data: categories } = useAsync(fetchCategories);

  return (
    <footer className="border-border bg-surface-sunken mt-24 border-t">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">
          <div className="max-w-sm space-y-5">
            <BrandMark />
            <p className="text-content-muted text-sm leading-relaxed">
              Premium natural hair and body care. Naturally derived ingredients, cruelty-free
              practices, and formulas gentle enough for everyday use.
            </p>
            <NewsletterForm />
          </div>

          <nav aria-labelledby="footer-shop">
            <h2 id="footer-shop" className={COLUMN_HEADING}>
              Collections
            </h2>
            <ul className="space-y-2.5">
              {(categories ?? []).slice(0, 7).map((category) => (
                <li key={category.slug}>
                  <Link to={categoryPath(category.slug)} className={COLUMN_LINK}>
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-company">
            <h2 id="footer-company" className={COLUMN_HEADING}>
              Company
            </h2>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={COLUMN_LINK}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="mailto:Skenvisiontime@yahoo.com" className={COLUMN_LINK}>
                  Skenvisiontime@yahoo.com
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="border-border text-content-subtle mt-14 flex flex-col gap-3 border-t pt-7 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SK Envision. All rights reserved.</p>
          <p>
            A portfolio rebuild of skenvisiontime.com — no real orders are placed and no payments
            are processed.
          </p>
        </div>
      </Container>
    </footer>
  );
}
