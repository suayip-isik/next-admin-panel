import { describe, expect, it } from "vitest";
import { normalizeReturnPath } from "@/shared/lib/redirects";

describe("normalizeReturnPath", () => {
  it("accepts relative in-app paths", () => {
    expect(normalizeReturnPath("/users?page=2")).toBe("/users?page=2");
  });

  it("rejects protocol-relative paths", () => {
    expect(normalizeReturnPath("//evil.example.com")).toBeNull();
  });

  it("rejects absolute external urls", () => {
    expect(normalizeReturnPath("https://evil.example.com")).toBeNull();
  });
});
