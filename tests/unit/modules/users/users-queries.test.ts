import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import {
  changeUserEmail,
  createAdminUser,
  deleteUserAvatar,
  fetchDeletedUsers,
  fetchUsers,
  resendAdminInvite,
  resendUserVerification,
  updateUserProfile,
} from "@/modules/users/queries/users.queries";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    GET: vi.fn(),
    POST: vi.fn(),
    PATCH: vi.fn(),
    PUT: vi.fn(),
    DELETE: vi.fn(),
  },
}));

describe("users queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.GET).mockResolvedValue({
      data: { items: [] },
    } as never);
    vi.mocked(apiClient.POST).mockResolvedValue({ data: {} } as never);
    vi.mocked(apiClient.PATCH).mockResolvedValue({ data: {} } as never);
    vi.mocked(apiClient.PUT).mockResolvedValue({ data: {} } as never);
    vi.mocked(apiClient.DELETE).mockResolvedValue({ data: {} } as never);
  });

  it("sends the expected user management requests", async () => {
    await fetchUsers({ page: 2, size: 20, q: "Ada Lovelace" });
    await fetchDeletedUsers({ q: "Grace Hopper" });
    await createAdminUser({
      email: "admin@example.com",
      role_name: "panel_admin",
      full_name: "Ada Lovelace",
      username: "ada",
    });
    await updateUserProfile("user-1", {
      full_name: "Ada Byron",
      username: "abyron",
    });
    await changeUserEmail("user-1", { email: "new@example.com" });
    await resendUserVerification("user-1");
    await resendAdminInvite("user-1");
    await deleteUserAvatar("user-1");

    expect(apiClient.GET).toHaveBeenNthCalledWith(1, "/api/v1/admin/users", {
      params: {
        query: {
          page: 2,
          size: 20,
          q: "Ada Lovelace",
        },
      },
    });
    expect(apiClient.GET).toHaveBeenNthCalledWith(
      2,
      "/api/v1/admin/users/deleted",
      {
        params: {
          query: {
            q: "Grace Hopper",
          },
        },
      },
    );
    expect(apiClient.POST).toHaveBeenNthCalledWith(1, "/api/v1/admin/users", {
      body: {
        email: "admin@example.com",
        role_name: "panel_admin",
        full_name: "Ada Lovelace",
        username: "ada",
      },
    });
    expect(apiClient.PATCH).toHaveBeenCalledWith(
      "/api/v1/admin/users/{user_id}/profile",
      {
        params: { path: { user_id: "user-1" } },
        body: { full_name: "Ada Byron", username: "abyron" },
      },
    );
    expect(apiClient.POST).toHaveBeenNthCalledWith(
      2,
      "/api/v1/admin/users/{user_id}/change-email",
      {
        params: { path: { user_id: "user-1" } },
        body: { email: "new@example.com" },
      },
    );
    expect(apiClient.POST).toHaveBeenNthCalledWith(
      3,
      "/api/v1/admin/users/{user_id}/resend-verification",
      {
        params: { path: { user_id: "user-1" } },
      },
    );
    expect(apiClient.POST).toHaveBeenNthCalledWith(
      4,
      "/api/v1/admin/users/{user_id}/resend-invite",
      {
        params: { path: { user_id: "user-1" } },
      },
    );
    expect(apiClient.DELETE).toHaveBeenCalledWith(
      "/api/v1/admin/users/{user_id}/avatar",
      {
        params: { path: { user_id: "user-1" } },
      },
    );
  });
});
