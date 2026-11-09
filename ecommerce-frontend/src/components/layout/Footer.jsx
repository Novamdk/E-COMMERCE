import { Link } from 'react-router-dom';
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { SiFacebook, SiInstagram, SiPinterest, SiTiktok } from 'react-icons/si';
import { collectionPath, COLLECTIONS, CONTACT, ROUTES, SOCIAL_LINKS } from '@/lib/constants';
import { Image } from '@/components/ui/Image';
import { LanguageSelect, useT } from '@/features/i18n';
import { Container } from './Container';
import { PaymentMethods } from './PaymentMethods';
import { SignUpBand } from './SignUpBand';

/** Labels are translation keys. */
const HELP_LINKS = [
  { to: ROUTES.CONTACT, label: 'footer.contact' },
  { to: ROUTES.ORDERS, label: 'footer.orders' },
  { to: ROUTES.CART, label: 'footer.bag' },
];

const COMPANY_LINKS = [
  { to: ROUTES.ABOUT, label: 'footer.story' },
  { to: ROUTES.STORES, label: 'nav.findStore' },
  { to: ROUTES.WISHLIST, label: 'footer.wishlist' },
  { to: ROUTES.SIGN_IN, label: 'footer.signIn' },
];

const SOCIAL_ICONS = {
  facebook: SiFacebook,
  instagram: SiInstagram,
  tiktok: SiTiktok,
  pinterest: SiPinterest,
};

const COLUMN_HEADING =
  'mb-5 text-[0.6875rem] font-semibold tracking-[0.16em] text-content-inverse uppercase';
const COLUMN_LINK = 'text-sm text-content-inverse/65 transition-colors hover:text-content-inverse';

export function Footer() {
  const { t } = useT();

  return (
    <footer className="bg-surface-inverse text-content-inverse mt-24">
      <Container width="wide" className="py-16 lg:py-20">
        <SignUpBand />

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-16">
          <div className="max-w-sm space-y-6">
            <Link
              to={ROUTES.HOME}
              aria-label="SK Envision — home"
              className="grid size-32 place-items-center rounded-full bg-white transition-opacity hover:opacity-90 sm:size-40"
            >
              <Image
                name="brand-mark"
                alt=""
                sizes="8rem"
                ratio="aspect-[400/319]"
                fit="contain"
                isTransparent
                className="w-20 sm:w-24"
              />
            </Link>

            <ul aria-label={t('footer.social')} className="flex gap-2 pt-2">
              {SOCIAL_LINKS.map((social) => {
                const Icon = SOCIAL_ICONS[social.id];
                return (
                  <li key={social.id}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t('footer.socialLink', { network: social.label })}
                      className="border-content-inverse/25 text-content-inverse/80 hover:border-gold-400 hover:text-gold-300 grid size-10 place-items-center rounded-full border transition-colors"
                    >
                      <Icon aria-hidden="true" className="size-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <nav aria-labelledby="footer-shop">
            <h2 id="footer-shop" className={COLUMN_HEADING}>
              {t('footer.shop')}
            </h2>
            <ul className="space-y-3">
              <li>
                <Link to={ROUTES.SHOP} className={COLUMN_LINK}>
                  {t('footer.shopAll')}
                </Link>
              </li>
              {Object.entries(COLLECTIONS).map(([slug, collection]) => (
                <li key={slug}>
                  <Link to={collectionPath(slug)} className={COLUMN_LINK}>
                    {t(collection.title)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-help">
            <h2 id="footer-help" className={COLUMN_HEADING}>
              {t('footer.help')}
            </h2>
            <ul className="space-y-3">
              {HELP_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={COLUMN_LINK}>
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>

            <address className="mt-8 space-y-3 not-italic">
              <p className={`${COLUMN_LINK} flex gap-2.5`}>
                <FiMapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <span>
                  {CONTACT.ADDRESS_LINES.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </p>
              <a href={CONTACT.PHONE_HREF} className={`${COLUMN_LINK} flex items-center gap-2.5`}>
                <FiPhone aria-hidden="true" className="size-4 shrink-0" />
                {CONTACT.PHONE}
              </a>
              <a
                href={`mailto:${CONTACT.EMAIL}`}
                className={`${COLUMN_LINK} flex items-center gap-2.5 break-all`}
              >
                <FiMail aria-hidden="true" className="size-4 shrink-0" />
                {CONTACT.EMAIL}
              </a>
            </address>
          </nav>

          <nav aria-labelledby="footer-company">
            <h2 id="footer-company" className={COLUMN_HEADING}>
              {t('footer.company')}
            </h2>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={COLUMN_LINK}>
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-content-inverse/15 mt-16 grid gap-8 border-t pt-8 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12">
          <PaymentMethods />
          <div className="text-content-inverse/50 space-y-3 text-xs lg:text-right">
            <LanguageSelect tone="inverse" />
            <p>{t('footer.rights', { year: new Date().getFullYear() })}</p>
            <p>{t('footer.demo')}</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
