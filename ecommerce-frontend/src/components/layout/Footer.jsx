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

const HELP_LINKS = [
  { to: ROUTES.CONTACT, label: 'Contact us' },
  { to: ROUTES.ORDERS, label: 'Order history' },
  { to: ROUTES.CART, label: 'Your bag' },
];

const COMPANY_LINKS = [
  { to: ROUTES.ABOUT, label: 'Our story' },
  { to: ROUTES.WISHLIST, label: 'Wishlist' },
  { to: ROUTES.SIGN_IN, label: 'Sign in' },
];

const COLUMN_HEADING =
  'mb-5 text-[0.6875rem] font-semibold tracking-[0.16em] text-content-inverse uppercase';
const COLUMN_LINK = 'text-sm text-content-inverse/65 transition-colors hover:text-content-inverse';

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
        <Button type="submit" variant="inverse">
          Sign up
        </Button>
      </div>
      <p
        id="newsletter-feedback"
        aria-live="polite"
        className={
          state.status === 'error' ? 'text-danger-500 text-xs' : 'text-content-inverse/50 text-xs'
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
    <footer className="bg-surface-inverse text-content-inverse mt-24">
      <Container width="wide" className="py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-16">
          <div className="max-w-sm space-y-6">
            <p className="font-display text-display-sm leading-tight">
              Join the list for 10% off your first order.
            </p>
            <NewsletterForm />
          </div>

          <nav aria-labelledby="footer-shop">
            <h2 id="footer-shop" className={COLUMN_HEADING}>
              Shop
            </h2>
            <ul className="space-y-3">
              <li>
                <Link to={ROUTES.SHOP} className={COLUMN_LINK}>
                  Shop all
                </Link>
              </li>
              {(categories ?? []).slice(0, 6).map((category) => (
                <li key={category.slug}>
                  <Link to={categoryPath(category.slug)} className={COLUMN_LINK}>
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-help">
            <h2 id="footer-help" className={COLUMN_HEADING}>
              Help
            </h2>
            <ul className="space-y-3">
              {HELP_LINKS.map((link) => (
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

          <nav aria-labelledby="footer-company">
            <h2 id="footer-company" className={COLUMN_HEADING}>
              SK Envision
            </h2>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={COLUMN_LINK}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-content-inverse/15 mt-16 flex flex-col gap-6 border-t pt-8 sm:flex-row sm:items-end sm:justify-between">
          <BrandMark size="sm" isInverse />
          <div className="text-content-inverse/50 space-y-1 text-xs sm:text-right">
            <p>© {new Date().getFullYear()} SK Envision. All rights reserved.</p>
            <p>Demo storefront — no real orders are placed and no payments are processed.</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
