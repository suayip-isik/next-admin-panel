export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
    public readonly hasUserMessage = true,
  ) {
    super(message);
    this.name = "AppError";
  }
}

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  detail?: string | Array<{ msg: string; loc: unknown[] }>;
}

interface ApiResult<T> {
  data?: T;
  error?: ApiErrorBody;
  response?: Response;
}

export function parseApiError(status: number, body: ApiErrorBody): AppError {
  if (body.error) {
    const message =
      typeof body.error.message === "string" ? body.error.message : "";

    return new AppError(
      status,
      body.error.code ?? "UNKNOWN_ERROR",
      message,
      body.error.details,
      Boolean(message),
    );
  }

  if (typeof body.detail === "string") {
    return new AppError(status, "API_ERROR", body.detail);
  }

  if (Array.isArray(body.detail)) {
    const messages = body.detail.map((e) => e.msg).join(", ");
    return new AppError(status, "VALIDATION_ERROR", messages, body.detail);
  }

  return new AppError(status, "UNKNOWN_ERROR", "", undefined, false);
}

export function unwrapApiResult<T>(result: ApiResult<T>): T {
  if (result.error) {
    throw parseApiError(result.response?.status ?? 500, result.error);
  }

  return result.data as T;
}

export function getErrorMessage(
  error: unknown,
  fallback = "An unexpected error occurred.",
): string {
  if (error instanceof AppError) {
    return error.hasUserMessage && error.message ? error.message : fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message
  ) {
    return error.message;
  }

  return fallback;
}
