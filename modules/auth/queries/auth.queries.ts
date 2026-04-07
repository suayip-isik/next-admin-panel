import { apiClient } from "@/lib/api-client";
import { parseApiError } from "@/lib/errors";
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
  const { data, error } = await apiClient.POST("/api/v1/auth/forgot-password", {
    body: input,
  });
  if (error) throw error;
  return data;
}

export async function resetPasswordMutation(input: ResetPasswordInput) {
  const { data, error } = await apiClient.POST("/api/v1/auth/reset-password", {
    body: input,
  });
  if (error) throw error;
  return data;
}

export async function resendVerificationMutation(email: string) {
  const { data, error } = await apiClient.POST(
    "/api/v1/auth/resend-verification",
    { body: { email } },
  );
  if (error) throw error;
  return data;
}
