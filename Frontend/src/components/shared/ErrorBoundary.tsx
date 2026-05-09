import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-background text-white gap-6 p-8">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-center max-w-md">
            <h2 className="text-xl font-black tracking-tighter mb-2">Something went wrong</h2>
            <p className="text-sm text-white/40 font-mono break-all">
              {this.state.error?.message || 'Unknown error'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="px-6 py-3 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl text-sm font-black uppercase tracking-widest transition-all"
          >
            Reload Workspace
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
