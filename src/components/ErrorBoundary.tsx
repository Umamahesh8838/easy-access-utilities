import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background pt-20 px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-destructive/50">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <CardTitle className="text-destructive">Something went wrong</CardTitle>
                    <CardDescription>
                      An unexpected error occurred while loading this tool.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                  <strong>Error:</strong> {this.state.error?.message || "Unknown error"}
                </div>
                
                <div className="flex space-x-3">
                  <Button onClick={this.handleReset} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button onClick={this.handleReload} variant="default">
                    Reload Page
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/'}
                    variant="secondary"
                  >
                    Go Home
                  </Button>
                </div>

                {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                  <details className="text-xs text-muted-foreground bg-muted p-4 rounded-lg">
                    <summary className="cursor-pointer font-medium">
                      Debug Information (Development)
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap">
                      {this.state.error?.stack}
                      {'\n\n'}
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
