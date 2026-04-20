'use client';

import React, { Component, type ReactNode } from 'react';

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean };

/**
 * Catches render errors in child components and displays a
 * graceful fallback UI instead of a blank page.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-20 text-center">
            <p className="mb-2 text-lg font-medium text-stone-300">
              Something went wrong
            </p>
            <p className="text-sm text-stone-500">
              Please try refreshing the page.
            </p>
          </section>
        )
      );
    }
    return this.props.children;
  }
}
