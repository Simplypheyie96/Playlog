import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gaming flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="glass rounded-2xl p-8 text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl text-white">Something went wrong</h2>
                <p className="text-sm text-[#B8B8D0]">
                  An unexpected error occurred. Don't worry, your data is safe.
                </p>
              </div>

              {this.state.error && (
                <div className="bg-[#0F0F1A] rounded-lg p-4 text-left">
                  <p className="text-xs text-[#B8B8D0] break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Button
                  onClick={this.handleReset}
                  className="w-full bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <p className="text-xs text-[#B8B8D0]">
                  If the problem persists, try exporting your data from Settings
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}