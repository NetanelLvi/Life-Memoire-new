
import { toast } from "sonner";
import { extractErrorMessage, ApiError, isApiError } from "./errorHandling";

/**
 * Configuration options for error handling
 */
export interface ErrorHandlerOptions<T> {
  errorMessage?: string;
  showToast?: boolean;
  fallbackData?: T;
  onError?: (error: unknown) => void;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * Centralized error handling for async operations
 * @param promise The promise to handle
 * @param options Configuration options
 * @returns A tuple with [data, error]
 */
export async function safeAsync<T>(
  promise: Promise<T>,
  options: ErrorHandlerOptions<T> = {}
): Promise<[T | null, unknown]> {
  const {
    errorMessage = "An error occurred",
    showToast = true,
    fallbackData = null,
    onError,
    retryCount = 0,
    retryDelay = 1000,
  } = options;

  let attempts = 0;
  let lastError: unknown;

  while (attempts <= retryCount) {
    try {
      const data = await promise;
      return [data, null];
    } catch (error) {
      lastError = error;
      attempts++;

      if (onError) {
        onError(error);
      }

      if (showToast) {
        const message = isApiError(error) 
          ? `${errorMessage} (${error.status})`
          : errorMessage;
        
        toast.error(message, {
          description: extractErrorMessage(error),
        });
      }

      if (attempts <= retryCount) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
        continue;
      }
    }
  }

  return [fallbackData as T, lastError];
}

/**
 * Wrapper for fetch operations with error handling and type safety
 */
export async function safeFetch<T>(
  url: string,
  options?: RequestInit,
  errorConfig?: {
    errorMessage?: string;
    showToast?: boolean;
    retryCount?: number;
    retryDelay?: number;
  }
): Promise<[T | null, unknown]> {
  return safeAsync<T>(
    fetch(url, options).then(async (response) => {
      if (!response.ok) {
        const error: ApiError = {
          message: `HTTP error! Status: ${response.status}`,
          status: response.status,
          code: response.status.toString(),
        };
        throw error;
      }
      return response.json() as Promise<T>;
    }),
    {
      errorMessage: errorConfig?.errorMessage || "Failed to fetch data",
      showToast: errorConfig?.showToast,
      retryCount: errorConfig?.retryCount,
      retryDelay: errorConfig?.retryDelay,
    }
  );
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {}
): Promise<T> {
  const { 
    retries = 3, 
    delay = 500, 
    maxDelay = 5000,
    onRetry 
  } = options;
  
  let lastError: unknown;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      
      if (onRetry) {
        onRetry(attempt + 1, err);
      }
      
      if (attempt < retries - 1) {
        const backoffDelay = Math.min(
          delay * Math.pow(2, attempt),
          maxDelay
        );
        
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }
  
  throw lastError;
}
