import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Top-level safety net: catches render errors anywhere in the tree below it
 * so a bug in one screen shows a recoverable message instead of a blank page.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[MISPORT OS] Unhandled UI error:', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (error) {
      if (this.props.fallback) return this.props.fallback(error, this.reset);
      return (
        <div className="min-h-screen bg-misportBlack flex items-center justify-center p-6">
          <div className="max-w-md text-center space-y-4 bg-misportDark border border-gray-800 rounded-xl p-8">
            <h1 className="text-xl font-bold text-white">Algo ha fallado</h1>
            <p className="text-sm text-gray-400">{error.message || 'Ha ocurrido un error inesperado.'}</p>
            <button
              onClick={this.reset}
              className="bg-misportBlue hover:bg-blue-600 text-white font-bold px-6 py-2.5 rounded-lg transition-all"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
