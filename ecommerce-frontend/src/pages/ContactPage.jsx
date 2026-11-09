import { useState } from 'react';
import { FiCheckCircle, FiClock, FiMail, FiMapPin } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/layout/PageShell';
import { useForm } from '@/hooks/useForm';
import { ROUTES } from '@/lib/constants';
import { email as validateEmail, required } from '@/lib/validators';

const SCHEMA = {
  name: required('Your name'),
  email: validateEmail,
  subject: required('Subject'),
  message: (value) => {
    const text = String(value ?? '').trim();
    if (!text) return 'Please tell us how we can help.';
    return text.length < 20 ? 'Please give us a little more detail (20 characters or more).' : null;
  },
};

const DETAILS = [
  {
    icon: FiMail,
    label: 'Email',
    value: 'Skenvisiontime@yahoo.com',
    href: 'mailto:Skenvisiontime@yahoo.com',
  },
  { icon: FiClock, label: 'Response time', value: 'Within one business day' },
  { icon: FiMapPin, label: 'Shipping from', value: 'United States' },
];

export default function ContactPage() {
  const [isSent, setIsSent] = useState(false);

  const form = useForm({
    initialValues: { name: '', email: '', subject: '', message: '' },
    schema: SCHEMA,
    onSubmit: () => setIsSent(true),
  });

  return (
    <PageShell>
      <PageHeader
        title="Get in touch"
        description="Questions about a product, an order, or which formula suits your hair type — send them over."
        breadcrumbs={[{ label: 'Home', to: ROUTES.HOME }, { label: 'Contact' }]}
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-16">
        <div className="max-w-xl">
          {isSent ? (
            <div className="rounded-panel border-border bg-surface-raised border p-8">
              <span className="bg-success-50 text-success-600 grid size-12 place-items-center rounded-full">
                <FiCheckCircle aria-hidden="true" className="size-6" />
              </span>
              <h2 className="font-display mt-5 text-2xl">Message sent</h2>
              <p className="text-content-muted mt-2 text-sm leading-relaxed">
                Thanks for reaching out — we will reply within one business day. (Demo note: this
                form validates locally and does not actually send anything.)
              </p>
              <Button
                variant="secondary"
                className="mt-6"
                onClick={() => {
                  form.reset();
                  setIsSent(false);
                }}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="name" label="Your name" error={form.errors.name}>
                  <Input
                    autoComplete="name"
                    hasError={Boolean(form.errors.name)}
                    {...form.getFieldProps('name')}
                  />
                </FormField>

                <FormField id="email" label="Email address" error={form.errors.email}>
                  <Input
                    type="email"
                    autoComplete="email"
                    hasError={Boolean(form.errors.email)}
                    {...form.getFieldProps('email')}
                  />
                </FormField>
              </div>

              <FormField id="subject" label="Subject" error={form.errors.subject}>
                <Input
                  placeholder="Which product is this about?"
                  hasError={Boolean(form.errors.subject)}
                  {...form.getFieldProps('subject')}
                />
              </FormField>

              <FormField id="message" label="Message" error={form.errors.message}>
                <textarea
                  rows={6}
                  placeholder="Tell us what you need…"
                  aria-invalid={Boolean(form.errors.message) || undefined}
                  className={`rounded-field bg-surface-raised placeholder:text-content-subtle w-full border px-3.5 py-3 text-[0.9375rem] ${
                    form.errors.message
                      ? 'border-danger-500'
                      : 'border-border hover:border-border-strong focus:border-brand-600'
                  }`}
                  {...form.getFieldProps('message')}
                />
              </FormField>

              <Button type="submit" size="lg" className="self-start">
                Send message
              </Button>
            </form>
          )}
        </div>

        <aside className="rounded-panel border-border bg-surface-raised h-fit border p-6">
          <h2 className="font-display text-xl">Other ways to reach us</h2>
          <dl className="mt-5 space-y-5">
            {DETAILS.map((detail) => (
              <div key={detail.label} className="flex gap-3">
                <span className="bg-surface-brand text-brand-700 grid size-9 shrink-0 place-items-center rounded-full">
                  <detail.icon aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <dt className="text-content-subtle text-xs">{detail.label}</dt>
                  <dd className="text-sm font-medium break-words">
                    {detail.href ? (
                      <a href={detail.href} className="hover:underline">
                        {detail.value}
                      </a>
                    ) : (
                      detail.value
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </PageShell>
  );
}
