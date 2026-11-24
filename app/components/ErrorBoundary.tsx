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
          <section className="mx-auto flex max-w-6xl flex-col items-center justify-center px-6 py-20 text-center">
            <p className="font-editorial mb-2 text-lg font-semibold text-[var(--app-ink)]">
              區塊載入發生異常 / Something went wrong
            </p>
            <p className="mb-5 text-sm text-[var(--app-muted)]">
              請點擊下方按鈕重試或重新整理頁面。 / Please retry or refresh the page.
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="rounded-full border border-[var(--app-rule)] bg-[var(--app-surface-card)] px-5 py-2 text-sm font-medium text-[var(--app-ink)] transition-colors hover:border-[var(--app-ink)] hover:bg-[var(--app-hover)]"
            >
              重新載入 / Try again
            </button>
          </section>
        )
      );
    }
    return this.props.children;
  }
}
