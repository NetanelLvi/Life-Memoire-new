
import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-6 rounded-md border border-red-200 bg-red-50 text-red-800 m-4">
          <AlertTriangle className="h-12 w-12 mb-2 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">משהו השתבש</h2>
          <p className="text-sm text-center mb-4">
            אנו מצטערים, אירעה שגיאה בעת טעינת התוכן.
          </p>
          <Button
            variant="outline"
            className="px-4 py-2 border border-red-300 hover:bg-red-100 rounded-md text-sm transition-colors"
            onClick={() => this.setState({ hasError: false })}
          >
            נסה שוב
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
