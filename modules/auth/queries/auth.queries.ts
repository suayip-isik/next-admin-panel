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

export async function loginMutation(input: LoginInput): Promise<LoginResult> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const body = (await response.json().catch(() => ({}))) as {
    requires_totp?: boolean;
    partial_token?: string;
    error?: {
      code?: string;
      message?: string;
      details?: unknown;
    };
    detail?: string | Array<{ msg: string; loc: unknown[] }>;
  };

  if (!response.ok) {
    throw parseApiError(response.status, body);
  }

  if (body.requires_totp && body.partial_token) {
    return { requires_totp: true, partial_token: body.partial_token };
  }

  return { requires_totp: false };
}

export async function totpChallengeMutation(input: {
  partial_token: string;
  code: string;
}) {
  const response = await fetch("/api/auth/totp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const body = (await response.json().catch(() => ({}))) as {
    error?: {
      code?: string;
      message?: string;
      details?: unknown;
    };
    detail?: string | Array<{ msg: string; loc: unknown[] }>;
  };
  if (!response.ok) throw parseApiError(response.status, body);
}

export async function logoutMutation() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: {
        code?: string;
        message?: string;
        details?: unknown;
      };
      detail?: string | Array<{ msg: string; loc: unknown[] }>;
    };
    throw parseApiError(response.status, body);
  }
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
