import { Button } from "@tixtrend/ui/components/button";
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary for EventSearch component
 * Catches errors from TanStack Query and displays a friendly error message
 */
class EventSearchErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error("EventSearch error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="max-w-md text-center">
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-4">
              We encountered an error while searching for events. Please try
              again.
            </p>
            {this.state.error && (
              <p className="text-sm text-muted-foreground mb-4 font-mono bg-muted p-2 rounded">
                {this.state.error.message}
              </p>
            )}
            <Button onClick={this.handleRetry} variant="secondary">
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EventSearchErrorBoundary;
