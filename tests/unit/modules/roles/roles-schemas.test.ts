import { describe, expect, it } from "vitest";
import {
  createRoleSchema,
  createUpdateRoleSchema,
} from "@/modules/roles/schemas/roles.schemas";

const t = (key: string) => key;

describe("role schemas", () => {
  it("accepts a valid role name and permissions", () => {
    const result = createRoleSchema(t).safeParse({
      name: "support_agent",
      description: "Support role",
      permissions: ["users:read", "roles:write"],
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid role names", () => {
    const result = createRoleSchema(t).safeParse({
      name: "Support Agent",
    });

    expect(result.success).toBe(false);
  });

  it("allows partial updates", () => {
    const result = createUpdateRoleSchema().safeParse({
      permissions: ["users:read"],
    });

    expect(result.success).toBe(true);
  });
});
