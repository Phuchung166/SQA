export interface ApiErrorResult {
  httpCode: number | null;
  errorMessage: string;
  isSuccess?: boolean;
  successMessage?: string;
  // legacy fields for backward compatibility
  message?: string;
  status?: number | null;
  original?: unknown;
}

/**
 * Parse an HTTP/axios error into a unified shape for frontend notifications.
 * Tries to pick a message from response.data.message, response.data.error,
 * response.data.errors (array), or falls back to error.message.
 */
export function parseApiError(error: unknown): ApiErrorResult {
  // use optional chaining defensively via casting
  const err = error as { response?: { status?: number; data?: unknown }; message?: string };
  const httpCode = err?.response?.status ?? null;

  // response data can be string or object
  const data = err?.response?.data;

  let errorMessage = '';

  if (data === undefined || data === null) {
    errorMessage = (err && err.message) || 'Unknown error';
  } else if (typeof data === 'string') {
    errorMessage = data;
  } else if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const maybeMsg = (obj.message as string | undefined) || (obj.error as string | undefined);
    if (maybeMsg) {
      errorMessage = maybeMsg;
    } else if (Array.isArray(obj.errors) && obj.errors.length > 0) {
      const first = obj.errors[0] as unknown;
      if (typeof first === 'object' && first !== null) {
        const f = first as Record<string, unknown>;
        errorMessage = (f.message as string | undefined) || JSON.stringify(first) || '';
      } else {
        errorMessage = String(first);
      }
    } else {
      errorMessage = JSON.stringify(obj);
    }
  }

  if (!errorMessage) errorMessage = (err && err.message) || 'Unknown error';

  const result: ApiErrorResult = {
    httpCode,
    errorMessage,
    isSuccess:
      httpCode === 200 ||
      (typeof data === 'object' && (data as Record<string, unknown>)?.success === true),
    successMessage: (() => {
      if (typeof data === 'object' && data !== null) {
        const obj = data as Record<string, unknown>;
        if (obj.message !== undefined && obj.message !== null) return String(obj.message);
      }
      return undefined;
    })(),
    message: errorMessage,
    status: httpCode,
    original: error,
  };

  return result;
}

/**
 * Convenience helper that returns a human-friendly error message for UI.
 * If given an ApiErrorResult it returns its errorMessage, otherwise it parses.
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return 'Unknown error';
  // If it's already parsed
  const maybe = error as ApiErrorResult;
  if (maybe && typeof maybe.errorMessage === 'string' && maybe.httpCode !== undefined) {
    return maybe.errorMessage;
  }
  try {
    return parseApiError(error).errorMessage;
  } catch {
    try {
      return String(error);
    } catch {
      return 'Unknown error';
    }
  }
}
