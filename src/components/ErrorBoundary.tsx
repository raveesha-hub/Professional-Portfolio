import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'An unexpected rendering error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Portfolio ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#080B1A] text-white">
          <div className="glass-panel-strong max-w-md w-full rounded-2xl p-8 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-display">Something paused unexpectedly</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-primary-gradient inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Experience
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
