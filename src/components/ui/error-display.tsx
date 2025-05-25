
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: "inline" | "card" | "full";
}

/**
 * A standardized error display component that can be used across the application
 */
export function ErrorDisplay({
  title = "Error",
  message,
  onRetry,
  variant = "card"
}: ErrorDisplayProps) {
  // Full page error
  if (variant === "full") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{message}</p>
          </CardContent>
          {onRetry && (
            <CardFooter>
              <Button onClick={onRetry} variant="outline" className="w-full">
                Try Again
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    );
  }

  // Inline error (for forms, etc.)
  if (variant === "inline") {
    return (
      <div className="text-destructive flex items-center text-sm mt-2">
        <AlertTriangle className="h-4 w-4 mr-1" />
        <span>{message}</span>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-auto p-1 ml-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Retry
          </Button>
        )}
      </div>
    );
  }

  // Default card style
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-destructive text-lg">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">{message}</p>
      </CardContent>
      {onRetry && (
        <CardFooter>
          <Button onClick={onRetry} variant="outline" size="sm">
            Try Again
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
