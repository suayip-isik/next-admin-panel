import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import {
  forgotPasswordMutation,
  loginMutation,
  logoutMutation,
  resendVerificationMutation,
  resetPasswordMutation,
  totpChallengeMutation,
} from "@/modules/auth/queries/auth.queries";
import { AppError } from "@/lib/errors";

const waitForLocaleSwitchMock = vi.fn();

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    POST: vi.fn(),
  },
}));

vi.mock("@/shared/lib/locale-switch", () => ({
  waitForLocaleSwitch: (...args: unknown[]) => waitForLocaleSwitchMock(...args),
}));

describe("auth queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    waitForLocaleSwitchMock.mockResolvedValue(undefined);
  });

  it("returns a full-login result when the route response does not require totp", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    await expect(
      loginMutation({ email: "user@example.com", password: "Secret123!" }),
    ).resolves.toEqual({ requires_totp: false });

    expect(fetch).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "user@example.com",
        password: "Secret123!",
      }),
    });
  });

  it("returns partial auth state when totp is required", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          requires_totp: true,
          partial_token: "partial-123",
        }),
        { status: 200 },
      ),
    );

    await expect(
      loginMutation({ email: "user@example.com", password: "Secret123!" }),
    ).resolves.toEqual({
      requires_totp: true,
      partial_token: "partial-123",
    });
  });

  it("throws parsed auth route errors", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: {
            code: "INACTIVE_USER",
            message: "This account is inactive.",
          },
        }),
        { status: 403 },
      ),
    );

    await expect(
      loginMutation({ email: "user@example.com", password: "Secret123!" }),
    ).rejects.toMatchObject<AppError>({
      status: 403,
      code: "INACTIVE_USER",
      message: "This account is inactive.",
    });
  });

  it("posts the totp code through the auth route", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 200 }));

    await totpChallengeMutation({
      partial_token: "partial-123",
      code: "123456",
    });

    expect(fetch).toHaveBeenCalledWith("/api/auth/totp", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        partial_token: "partial-123",
        code: "123456",
      }),
    });
  });

  it("uses the auth logout route", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 200 }));

    await logoutMutation();

    expect(fetch).toHaveBeenCalledWith("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  });

  it("sends forgot-password, reset-password and resend-verification payloads through the API client", async () => {
    vi.mocked(apiClient.POST).mockResolvedValue({ data: { ok: true } } as never);

    await forgotPasswordMutation({ email: "user@example.com" });
    await resetPasswordMutation({
      token: "reset-1",
      new_password: "Newpassword1",
      confirm_password: "Newpassword1",
    });
    await resendVerificationMutation("user@example.com");

    expect(apiClient.POST).toHaveBeenNthCalledWith(
      1,
      "/api/v1/auth/forgot-password",
      {
        body: { email: "user@example.com" },
      },
    );
    expect(apiClient.POST).toHaveBeenNthCalledWith(
      2,
      "/api/v1/auth/reset-password",
      {
        body: {
          token: "reset-1",
          new_password: "Newpassword1",
        },
      },
    );
    expect(apiClient.POST).toHaveBeenNthCalledWith(
      3,
      "/api/v1/auth/resend-verification",
      {
        body: { email: "user@example.com" },
      },
    );
  });
});
