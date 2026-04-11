import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import {
  changePassword,
  disableTotp,
  fetchBackupCodesCount,
  fetchProfile,
  regenerateBackupCodes,
  setupTotp,
  updateProfile,
  verifyTotp,
} from "@/modules/profile/queries/profile.queries";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    GET: vi.fn(),
    POST: vi.fn(),
    PATCH: vi.fn(),
  },
}));

describe("profile queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.GET).mockResolvedValue({ data: {} } as never);
    vi.mocked(apiClient.POST).mockResolvedValue({ data: {} } as never);
    vi.mocked(apiClient.PATCH).mockResolvedValue({ data: {} } as never);
  });

  it("uses the expected profile and totp endpoints", async () => {
    await fetchProfile();
    await updateProfile({ full_name: "Ada Lovelace" });
    await changePassword("Newpassword1");
    await setupTotp();
    await verifyTotp("123456");
    await disableTotp("654321");
    await fetchBackupCodesCount();
    await regenerateBackupCodes("654321");

    expect(apiClient.GET).toHaveBeenNthCalledWith(1, "/api/v1/shared/me");
    expect(apiClient.GET).toHaveBeenNthCalledWith(
      2,
      "/api/v1/shared/auth/totp/backup-codes/count",
    );
    expect(apiClient.PATCH).toHaveBeenNthCalledWith(1, "/api/v1/shared/me", {
      body: { full_name: "Ada Lovelace" },
    });
    expect(apiClient.PATCH).toHaveBeenNthCalledWith(2, "/api/v1/shared/me", {
      body: { password: "Newpassword1" },
    });
    expect(apiClient.POST).toHaveBeenNthCalledWith(
      1,
      "/api/v1/shared/auth/totp/setup",
    );
    expect(apiClient.POST).toHaveBeenNthCalledWith(
      2,
      "/api/v1/shared/auth/totp/verify",
      {
        body: { code: "123456" },
      },
    );
    expect(apiClient.POST).toHaveBeenNthCalledWith(
      3,
      "/api/v1/shared/auth/totp/disable",
      {
        body: { code: "654321" },
      },
    );
    expect(apiClient.POST).toHaveBeenNthCalledWith(
      4,
      "/api/v1/shared/auth/totp/backup-codes/regenerate",
      {
        body: { code: "654321" },
      },
    );
  });
});
