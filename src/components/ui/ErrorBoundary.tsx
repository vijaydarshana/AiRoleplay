'use client';
import React from 'react';


interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  return (
    <div className="min-h-screen bg-[#f6f7fb] flex items-center justify-center p-4">
      <div className="bg-white border border-red-200 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-sm">
        <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-xl">⚠️</span>
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-2">Something went wrong</h2>
        <p className="text-sm text-slate-500 mb-2 leading-relaxed">
          An unexpected error occurred. Please try refreshing the page.
        </p>
        {error?.message && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-5 font-mono break-all">
            {error.message}
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/home-screen'}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
          >
            Go Home
          </button>
          <button
            onClick={onReset}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold transition-all shadow-sm shadow-indigo-200"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
