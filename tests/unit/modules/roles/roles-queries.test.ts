import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import {
  createRole,
  deleteRole,
  fetchRole,
  fetchRoles,
  updateRole,
} from "@/modules/roles/queries/roles.queries";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    GET: vi.fn(),
    POST: vi.fn(),
    PATCH: vi.fn(),
    DELETE: vi.fn(),
  },
}));

describe("roles queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.GET).mockResolvedValue({ data: {} } as never);
    vi.mocked(apiClient.POST).mockResolvedValue({ data: {} } as never);
    vi.mocked(apiClient.PATCH).mockResolvedValue({ data: {} } as never);
    vi.mocked(apiClient.DELETE).mockResolvedValue({ data: {} } as never);
  });

  it("uses the expected role endpoints and payloads", async () => {
    await fetchRoles();
    await fetchRole("role-1");
    await createRole({
      name: "support_agent",
      description: "Support",
      permissions: ["users:read"],
    });
    await updateRole("role-1", {
      description: "Updated",
      permissions: ["roles:write"],
    });
    await deleteRole("role-1");

    expect(apiClient.GET).toHaveBeenNthCalledWith(1, "/api/v1/roles");
    expect(apiClient.GET).toHaveBeenNthCalledWith(2, "/api/v1/roles/{role_id}", {
      params: { path: { role_id: "role-1" } },
    });
    expect(apiClient.POST).toHaveBeenCalledWith("/api/v1/roles", {
      body: {
        name: "support_agent",
        description: "Support",
        permissions: ["users:read"],
      },
    });
    expect(apiClient.PATCH).toHaveBeenCalledWith("/api/v1/roles/{role_id}", {
      params: { path: { role_id: "role-1" } },
      body: {
        description: "Updated",
        permissions: ["roles:write"],
      },
    });
    expect(apiClient.DELETE).toHaveBeenCalledWith("/api/v1/roles/{role_id}", {
      params: { path: { role_id: "role-1" } },
    });
  });
});
