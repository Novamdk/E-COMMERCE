import { Component } from 'react';

/**
 * Last line of defence for render-time crashes. Route-level failures are
 * handled by the router's errorElement; this catches everything above it,
 * including the providers.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  /** @param {Error} error */
  static getDerivedStateFromError(error) {
    return { error };
  }

  handleReload = () => {
    window.location.assign('/');
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="bg-surface grid min-h-dvh place-items-center px-4">
        <div className="w-full max-w-md space-y-5 text-center">
          <p className="text-content-subtle text-xs font-semibold tracking-[0.08em] uppercase">
            Something broke
          </p>
          <h1 className="font-display text-display-sm">This page hit an unexpected error</h1>
          <p className="text-content-muted text-sm leading-relaxed">
            The storefront ran into a problem it could not recover from. Reloading usually clears it
            — your cart and saved items are stored locally and will still be here.
          </p>
          <pre className="rounded-field bg-surface-sunken text-content-muted overflow-x-auto px-3.5 py-3 text-left text-xs">
            {error.message}
          </pre>
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded-field bg-brand-700 text-content-inverse hover:bg-brand-800 inline-flex h-11 items-center justify-center px-6 text-[0.9375rem] font-medium transition-colors"
          >
            Back to the homepage
          </button>
        </div>
      </div>
    );
  }
}
