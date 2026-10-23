import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-4 sm:p-6 text-center w-full">
          <div className="w-full max-w-md p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-rose-500/30 shadow-2xl backdrop-blur-md">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">Something went wrong</h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              An unexpected render error occurred in this view.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all shadow-lg shadow-emerald-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload View</span>
              </button>
              <a
                href="/"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-all text-center flex items-center justify-center"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
