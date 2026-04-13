import { setAuthCookies } from "@/lib/auth/cookies";
import { forwardToFastApi } from "@/lib/auth/fastapi";

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  detail?: string | Array<{ msg: string; loc: unknown[] }>;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

export interface PartialAuthResponse {
  requires_totp: true;
  partial_token: string;
}

function isTokenResponse(value: unknown): value is TokenResponse {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return (
    typeof body.access_token === "string" &&
    typeof body.refresh_token === "string"
  );
}

export function isPartialAuthResponse(
  value: unknown,
): value is PartialAuthResponse {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return body.requires_totp === true && typeof body.partial_token === "string";
}

export function createInternalAuthErrorResponse(
  status: number,
  code: string,
  details?: unknown,
) {
  return Response.json(
    {
      error: {
        code,
        ...(details === undefined ? {} : { details }),
      },
    },
    { status },
  );
}

export async function finalizeAuthResponse(body: unknown): Promise<Response> {
  if (!isTokenResponse(body)) {
    return createInternalAuthErrorResponse(502, "INVALID_AUTH_RESPONSE", body);
  }

  await setAuthCookies(body);

  return Response.json({ success: true });
}

async function parseBody(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function exchangeTokens(
  path: string,
  payload: unknown,
): Promise<Response> {
  const response = await forwardToFastApi(path, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const body = await parseBody(response);

  if (!response.ok) {
    return Response.json((body ?? {}) as ApiErrorBody, {
      status: response.status,
    });
  }

  return finalizeAuthResponse(body);
}
