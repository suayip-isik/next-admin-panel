import { apiClient } from "@/lib/api-client";
import { parseApiError, unwrapApiResult } from "@/lib/errors";
import { waitForLocaleSwitch } from "@/shared/lib/locale-switch";
import type {
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../schemas/auth.schemas";

export type LoginResult =
  | { requires_totp: false }
  | { requires_totp: true; partial_token: string };

type AuthRouteErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  detail?: string | Array<{ msg: string; loc: unknown[] }>;
};

async function readAuthRouteBody<T>(response: Response): Promise<T> {
  return (await response.json().catch(() => ({}))) as T;
}

async function postAuthRoute<TResponse>(
  path: string,
  init: {
    body?: BodyInit;
    headers?: HeadersInit;
  } = {},
): Promise<TResponse> {
  await waitForLocaleSwitch();

  const response = await fetch(path, {
    method: "POST",
    credentials: "include",
    ...init,
  });

  if (!response.ok) {
    const body = await readAuthRouteBody<AuthRouteErrorBody>(response);
    throw parseApiError(response.status, body);
  }

  return readAuthRouteBody<TResponse>(response);
}

export async function loginMutation(input: LoginInput): Promise<LoginResult> {
  const body = await postAuthRoute<{
    requires_totp?: boolean;
    partial_token?: string;
  }>("/api/auth/login", {
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  if (body.requires_totp && body.partial_token) {
    return { requires_totp: true, partial_token: body.partial_token };
  }

  return { requires_totp: false };
}

export async function totpChallengeMutation(input: {
  partial_token: string;
  code: string;
}) {
  await postAuthRoute<void>("/api/auth/totp", {
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function logoutMutation() {
  await postAuthRoute<void>("/api/auth/logout");
}

export async function forgotPasswordMutation(input: ForgotPasswordInput) {
  return unwrapApiResult(
    await apiClient.POST("/api/v1/auth/forgot-password", {
      body: input,
    }),
  );
}

export async function resetPasswordMutation(input: ResetPasswordInput) {
  return unwrapApiResult(
    await apiClient.POST("/api/v1/auth/reset-password", {
      body: {
        token: input.token,
        new_password: input.new_password,
      },
    }),
  );
}

export async function resendVerificationMutation(email: string) {
  return unwrapApiResult(
    await apiClient.POST("/api/v1/auth/resend-verification", {
      body: { email },
    }),
  );
}
