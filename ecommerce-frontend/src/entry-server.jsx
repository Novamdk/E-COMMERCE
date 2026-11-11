import { StrictMode } from 'react';
import { prerender } from 'react-dom/static';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom';
import { ErrorBoundary } from '@/app/ErrorBoundary';
import { Providers } from '@/app/providers';
import { routes } from '@/app/routes';
import { collectServerData, startServerData } from '@/lib/ssr';

const handler = createStaticHandler(routes);

/**
 * Renders one page to HTML at build time, waiting for its route chunk and
 * its data, for scripts/prerender.mjs. The tree mirrors App.jsx so the
 * browser can hydrate it.
 *
 * @param {string} pathname
 * @returns {Promise<{html: string, data: Record<string, unknown>}>}
 */
export async function render(pathname) {
  const context = await handler.query(new Request(new URL(pathname, 'http://localhost')));
  if (context instanceof Response) throw new Error(`${pathname} redirects`);
  const router = createStaticRouter(handler.dataRoutes, context);

  startServerData();
  try {
    const { prelude } = await prerender(
      <StrictMode>
        <ErrorBoundary>
          <Providers>
            <StaticRouterProvider router={router} context={context} hydrate={false} />
          </Providers>
        </ErrorBoundary>
      </StrictMode>,
      // Keep every finished section inline, in reading order. React's default
      // splits large sections out and swaps them in with a script, which
      // readers that do not run JavaScript would never see.
      { progressiveChunkSize: Number.POSITIVE_INFINITY },
    );
    const html = await new Response(prelude).text();
    return { html, data: collectServerData() };
  } catch (error) {
    collectServerData();
    throw error;
  }
}
