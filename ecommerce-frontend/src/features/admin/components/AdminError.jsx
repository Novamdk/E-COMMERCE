import { ErrorPanel } from '@/components/ui/ErrorPanel';

/** Error panel with plain words for "no access" and "not set up". */
export function AdminError({ error, onRetry }) {
  if (error?.status === 403) {
    return (
      <ErrorPanel
        title="No access"
        error={{
          message: `${error.message} Ask the store owner to add your email to the admin list.`,
        }}
      />
    );
  }
  return <ErrorPanel title="Could not load" error={error} onRetry={onRetry} />;
}
