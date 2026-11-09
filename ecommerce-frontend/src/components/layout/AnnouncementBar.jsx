import { ANNOUNCEMENTS } from '@/lib/constants';
import { LanguageSelect, useT } from '@/features/i18n';

/** Copies of the message list laid end to end, so the loop has no visible seam. */
const REPEATS = 4;

/**
 * Slim promo ticker above the header: the announcements scroll sideways in a
 * continuous loop (pure CSS, see .animate-marquee) and stop while hovered so
 * a shopper can read one. Reduced-motion users get a still bar, and screen
 * readers get the messages once, as a plain list. From lg up the language
 * picker sits at the far right.
 */
export function AnnouncementBar() {
  const { t } = useT();
  const messages = ANNOUNCEMENTS.map((item) => t(item.key, item.values));

  return (
    <section
      aria-label={t('announcements.label')}
      className="bg-surface-inverse text-content-inverse flex h-9 items-center"
    >
      <ul className="sr-only">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>

      <div
        className="group flex h-full min-w-0 flex-1 items-center overflow-hidden"
        aria-hidden="true"
      >
        <div className="animate-marquee flex w-max shrink-0 items-center group-hover:[animation-play-state:paused]">
          {Array.from({ length: REPEATS }, (_, copy) =>
            messages.map((message) => (
              <span
                key={`${copy}-${message}`}
                className="flex items-center text-[0.6875rem] font-medium tracking-[0.14em] whitespace-nowrap uppercase"
              >
                <span className="px-8">{message}</span>
                <span className="text-gold-400">✦</span>
              </span>
            )),
          )}
        </div>
      </div>

      <div className="bg-surface-inverse hidden h-full shrink-0 items-center pr-8 pl-4 lg:flex">
        <LanguageSelect tone="inverse" />
      </div>
    </section>
  );
}
