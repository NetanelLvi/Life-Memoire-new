import { toast } from "sonner";

// Error types
export type ErrorWithMessage = {
  message: string;
};

export type ErrorWithCode = ErrorWithMessage & {
  code?: string | number;
};

export type ApiError = ErrorWithCode & {
  status?: number;
  details?: unknown;
};

export type ValidationError = ErrorWithMessage & {
  field?: string;
  errors?: string[];
};

// Type guard for error with message
export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

// Type guard for API error
export function isApiError(error: unknown): error is ApiError {
  return (
    isErrorWithMessage(error) &&
    'code' in error &&
    (
      typeof (error as ApiError).status === 'number' ||
      typeof (error as ApiError).details !== 'undefined'
    )
  );
}

// Type guard for validation error
export function isValidationError(error: unknown): error is ValidationError {
  return (
    isErrorWithMessage(error) &&
    (
      typeof (error as ValidationError).field === 'string' ||
      Array.isArray((error as ValidationError).errors)
    )
  );
}

// Extract error message from different error types
export function extractErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'אירעה שגיאה לא צפויה';
}

// Handle API errors with proper typing
export function handleApiError(error: unknown): string {
  if (isApiError(error)) {
    console.error("API Error:", {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details
    });
    return error.message;
  }

  const message = extractErrorMessage(error);
  console.error("API Error:", error);
  return message;
}

// Display error toast with standardized format
export function showErrorToast(error: unknown, title = 'שגיאה') {
  const message = extractErrorMessage(error);
  toast.error(title, {
    description: message,
  });
}

// Display success toast with standardized format
export function showSuccessToast(message: string, title = 'הצלחה') {
  toast.success(title, {
    description: message,
  });
}

// Handle validation errors
export function handleValidationError(error: unknown): string[] {
  if (isValidationError(error)) {
    if (error.errors) {
      return error.errors;
    }
    return [`${error.field}: ${error.message}`];
  }
  return [extractErrorMessage(error)];
}
