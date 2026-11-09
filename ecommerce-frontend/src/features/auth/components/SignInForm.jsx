import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { useForm } from '@/hooks/useForm';
import { required, email as validateEmail } from '@/lib/validators';
import { useAuth } from '../useAuth';

const SCHEMA = {
  email: validateEmail,
  password: required('Password'),
};

/**
 * @param {object} props
 * @param {string} props.redirectTo where to go after a successful sign-in
 */
export function SignInForm({ redirectTo }) {
  const { signIn, isSubmitting, error } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: { email: '', password: '' },
    schema: SCHEMA,
    onSubmit: async (values) => {
      const result = await signIn(values);
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

      <FormField id="email" label="Email address" error={form.errors.email}>
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          hasError={Boolean(form.errors.email)}
          {...form.getFieldProps('email')}
        />
      </FormField>

      <FormField id="password" label="Password" error={form.errors.password}>
        <Input
          type="password"
          autoComplete="current-password"
          hasError={Boolean(form.errors.password)}
          {...form.getFieldProps('password')}
        />
      </FormField>

      <Button type="submit" size="lg" isFullWidth isLoading={isSubmitting || form.isSubmitting}>
        Sign in
      </Button>
    </form>
  );
}
