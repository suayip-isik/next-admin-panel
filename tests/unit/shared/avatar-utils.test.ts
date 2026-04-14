import { describe, expect, it } from "vitest";
import {
  buildAvatarSrc,
  getAvatarDisplayName,
  getAvatarPresentation,
  getUserInitials,
} from "@/shared/utils/avatar";

describe("avatar utils", () => {
  it("builds initials from full name when available", () => {
    expect(getUserInitials("ada@example.com", "Ada Lovelace")).toBe("AL");
  });

  it("falls back to email initials when full name is missing", () => {
    expect(getUserInitials("selim@example.com", null)).toBe("SE");
  });

  it("adds a revision query param to avatar urls", () => {
    expect(buildAvatarSrc("https://cdn.example.com/avatar.png", 123)).toBe(
      "https://cdn.example.com/avatar.png?v=123",
    );
  });

  it("returns the original avatar url when no revision exists", () => {
    expect(buildAvatarSrc("https://cdn.example.com/avatar.png", null)).toBe(
      "https://cdn.example.com/avatar.png",
    );
  });

  it("preserves existing query params when adding a revision", () => {
    expect(
      buildAvatarSrc("https://cdn.example.com/avatar.png?size=64", 456),
    ).toBe("https://cdn.example.com/avatar.png?size=64&v=456");
  });

  it("returns null when there is no avatar url", () => {
    expect(buildAvatarSrc(null, 123)).toBeNull();
  });

  it("returns a display name only for real file names", () => {
    expect(getAvatarDisplayName("avatar.png")).toBe("avatar.png");
    expect(getAvatarDisplayName("   ")).toBeNull();
    expect(getAvatarDisplayName(null)).toBeNull();
  });

  it("builds a consistent avatar presentation payload", () => {
    expect(
      getAvatarPresentation({
        email: "ada@example.com",
        fullName: "Ada Lovelace",
        avatarUrl: "https://cdn.example.com/avatar.png",
        revision: 99,
      }),
    ).toEqual({
      src: "https://cdn.example.com/avatar.png?v=99",
      fallback: "AL",
    });
  });
});
