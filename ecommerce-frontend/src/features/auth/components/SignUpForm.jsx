import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { useForm } from '@/hooks/useForm';
import { email as validateEmail, password as validatePassword, required } from '@/lib/validators';
import { useAuth } from '../useAuth';

const SCHEMA = {
  name: required('Your name'),
  email: validateEmail,
  password: validatePassword,
  confirmPassword: (value, values) => {
    if (!value) return 'Please confirm your password.';
    return value === values.password ? null : 'Passwords do not match.';
  },
};

/**
 * @param {object} props
 * @param {string} props.redirectTo where to go after a successful sign-up
 */
export function SignUpForm({ redirectTo }) {
  const { signUp, isSubmitting, error } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: { name: '', email: '', password: '', confirmPassword: '' },
    schema: SCHEMA,
    onSubmit: async (values) => {
      const result = await signUp({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      if (result.ok) navigate(redirectTo, { replace: true });
    },
  });

  return (
    <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-4">
      {error && (
        <p
          role="alert"
          aria-live="assertive"
          className="rounded-field bg-danger-50 text-danger-600 px-3.5 py-2.5 text-sm"
        >
          {error}
        </p>
      )}

      <FormField id="name" label="Full name" error={form.errors.name}>
        <Input
          autoComplete="name"
          placeholder="Jordan Reyes"
          hasError={Boolean(form.errors.name)}
          {...form.getFieldProps('name')}
        />
      </FormField>

      <FormField id="email" label="Email address" error={form.errors.email}>
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          hasError={Boolean(form.errors.email)}
          {...form.getFieldProps('email')}
        />
      </FormField>

      <FormField
        id="password"
        label="Password"
        hint="At least 8 characters, with a letter and a number."
        error={form.errors.password}
      >
        <Input
          type="password"
          autoComplete="new-password"
          hasError={Boolean(form.errors.password)}
          {...form.getFieldProps('password')}
        />
      </FormField>

      <FormField id="confirmPassword" label="Confirm password" error={form.errors.confirmPassword}>
        <Input
          type="password"
          autoComplete="new-password"
          hasError={Boolean(form.errors.confirmPassword)}
          {...form.getFieldProps('confirmPassword')}
        />
      </FormField>

      <Button type="submit" size="lg" isFullWidth isLoading={isSubmitting || form.isSubmitting}>
        Create account
      </Button>
    </form>
  );
}
