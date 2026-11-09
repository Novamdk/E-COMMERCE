import { Image } from '@/components/ui/Image';
import { Container } from './Container';

/**
 * Split layout shared by sign-in and sign-up: form on the left, editorial
 * image on the right (dropped entirely below lg rather than squashed).
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.description
 * @param {import('react').ReactNode} [props.footer] the cross-link to the other page
 */
export function AuthShell({ title, description, footer, children }) {
  return (
    <Container className="py-12 sm:py-16">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="mx-auto w-full max-w-md">
          <h1 className="font-display text-display-sm sm:text-display">{title}</h1>
          <p className="text-content-muted mt-3">{description}</p>

          <div className="mt-8">{children}</div>

          <p className="rounded-field bg-surface-sunken text-content-muted mt-6 px-3.5 py-3 text-xs leading-relaxed">
            This is a mock sign-in. Accounts are stored in your browser&apos;s localStorage in plain
            text and never leave this device — do not reuse a real password.
          </p>

          {footer && <div className="text-content-muted mt-6 text-sm">{footer}</div>}
        </div>

        <div className="hidden lg:block">
          <Image
            name="shelf-mask"
            alt=""
            sizes="(min-width: 1024px) 32rem, 0px"
            ratio="aspect-[4/5]"
            fit="contain"
            className="rounded-panel bg-surface-brand p-10"
          />
        </div>
      </div>
    </Container>
  );
}
