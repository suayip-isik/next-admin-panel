import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import {
  createRole,
  deleteRole,
  fetchRole,
  fetchRoles,
  replaceRolePermissions,
  updateRoleDescription,
} from "@/modules/roles/queries/roles.queries";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    GET: vi.fn(),
    POST: vi.fn(),
    PATCH: vi.fn(),
    PUT: vi.fn(),
    DELETE: vi.fn(),
  },
}));

describe("roles queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.GET).mockResolvedValue({ data: {} } as never);
    vi.mocked(apiClient.POST).mockResolvedValue({ data: {} } as never);
    vi.mocked(apiClient.PATCH).mockResolvedValue({ data: {} } as never);
    vi.mocked(apiClient.PUT).mockResolvedValue({ data: {} } as never);
    vi.mocked(apiClient.DELETE).mockResolvedValue({ data: {} } as never);
  });

  it("uses the expected role endpoints and payloads", async () => {
    await fetchRoles();
    await fetchRole("role-1");
    await createRole({
      name: "support_agent",
      description: "Support",
      permissions: ["users.read.basic"],
    });
    await updateRoleDescription("role-1", {
      description: "Updated",
    });
    await replaceRolePermissions("role-1", {
      permissions: ["roles.update.permissions"],
    });
    await deleteRole("role-1");

    expect(apiClient.GET).toHaveBeenNthCalledWith(1, "/api/v1/admin/roles");
    expect(apiClient.GET).toHaveBeenNthCalledWith(
      2,
      "/api/v1/admin/roles/{role_id}",
      {
        params: { path: { role_id: "role-1" } },
      },
    );
    expect(apiClient.POST).toHaveBeenCalledWith("/api/v1/admin/roles", {
      body: {
        name: "support_agent",
        description: "Support",
        permissions: ["users.read.basic"],
      },
    });
    expect(apiClient.PATCH).toHaveBeenCalledWith(
      "/api/v1/admin/roles/{role_id}/description",
      {
        params: { path: { role_id: "role-1" } },
        body: {
          description: "Updated",
        },
      },
    );
    expect(apiClient.PUT).toHaveBeenCalledWith(
      "/api/v1/admin/roles/{role_id}/permissions",
      {
        params: { path: { role_id: "role-1" } },
        body: {
          permissions: ["roles.update.permissions"],
        },
      },
    );
    expect(apiClient.DELETE).toHaveBeenCalledWith(
      "/api/v1/admin/roles/{role_id}",
      {
        params: { path: { role_id: "role-1" } },
      },
    );
  });
});
