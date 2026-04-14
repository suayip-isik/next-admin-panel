import { describe, expect, it } from "vitest";
import { createRoleSchema } from "@/modules/roles/schemas/roles.schemas";

const t = (key: string) => key;

describe("role schemas", () => {
  it("accepts a valid role name and permissions", () => {
    const result = createRoleSchema(t).safeParse({
      name: "support_agent",
      description: "Support role",
      permissions: ["users.read.basic", "roles.update.permissions"],
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid role names", () => {
    const result = createRoleSchema(t).safeParse({
      name: "Support Agent",
    });

    expect(result.success).toBe(false);
  });

  it("allows canonical permissions", () => {
    const result = createRoleSchema(t).safeParse({
      name: "auditor",
      permissions: ["audit_logs.list"],
    });

    expect(result.success).toBe(true);
  });
});
