export interface NetworkError extends Error {
  isNetworkError: true;
  originalError?: unknown;
}

export function createNetworkError(
  message: string,
  originalError?: unknown,
): NetworkError {
  const error = new Error(message) as NetworkError;
  error.isNetworkError = true;
  error.originalError = originalError;
  return error;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return (
    error instanceof Error &&
    "isNetworkError" in error &&
    (error as Partial<NetworkError>).isNetworkError === true
  );
}
