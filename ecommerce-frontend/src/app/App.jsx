import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { endHydration } from '@/lib/ssr';
import { ErrorBoundary } from './ErrorBoundary';
import { Providers } from './providers';
import { router } from './router';

export function App() {
  // Runs after the whole first render has committed: from here on, data is
  // fetched in the browser rather than taken from the server HTML.
  useEffect(() => endHydration(), []);

  return (
    <ErrorBoundary>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </ErrorBoundary>
  );
}
