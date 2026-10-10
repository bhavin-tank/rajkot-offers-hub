/**
 * Errors the API reports to callers, with their HTTP status. Services throw
 * these; the route layer turns them into the `{ error }` envelope.
 */
export const ERRORS = {
  VALIDATION_FAILED: 400,
  UNAUTHENTICATED: 401,
  OTP_INVALID: 401,
  OTP_EXPIRED: 401,
  FORBIDDEN: 403,
  ACCOUNT_BLOCKED: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INVALID_STATE: 409,
  FILE_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA: 415,
  WHATSAPP_UNAVAILABLE: 422,
  LIMIT_REACHED: 422,
  RATE_LIMITED: 429,
  INTERNAL: 500,
  PROVIDER_UNAVAILABLE: 503,
} as const;

export type ErrorCode = keyof typeof ERRORS;

export class AppError extends Error {
  readonly status: number;

  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly extra?: { fields?: Record<string, string>; retryAfter?: number; attemptsLeft?: number },
  ) {
    super(message);
    this.name = "AppError";
    this.status = ERRORS[code];
  }
}

export const notFoundError = (what: string) => new AppError("NOT_FOUND", `${what} not found`);
