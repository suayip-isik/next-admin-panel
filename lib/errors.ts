export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
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

export function parseApiError(status: number, body: ApiErrorBody): AppError {
  if (body.error) {
    return new AppError(
      status,
      body.error.code ?? "UNKNOWN_ERROR",
      body.error.message ?? "An unexpected error occurred.",
      body.error.details,
    );
  }

  if (typeof body.detail === "string") {
    return new AppError(status, "API_ERROR", body.detail);
  }

  if (Array.isArray(body.detail)) {
    const messages = body.detail.map((e) => e.msg).join(", ");
    return new AppError(status, "VALIDATION_ERROR", messages, body.detail);
  }

  return new AppError(status, "UNKNOWN_ERROR", "An unexpected error occurred.");
}
