import { describe, it, expect } from "vitest";
import {
  truncate,
  capitalize,
  formatActionLabel,
  formatBytes,
  maskApiKey,
} from "@/shared/utils/format";

describe("truncate", () => {
  it("returns the original string when it does not exceed maxLength", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("does not truncate a string equal to maxLength", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });

  it("truncates and appends ellipsis when string exceeds maxLength", () => {
    expect(truncate("hello world", 5)).toBe("hello…");
  });

  it("truncates to 1 character", () => {
    expect(truncate("abc", 1)).toBe("a…");
  });
});

describe("capitalize", () => {
  it("capitalizes the first character", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("returns an empty string unchanged", () => {
    expect(capitalize("")).toBe("");
  });

  it("does not change an already capitalized string", () => {
    expect(capitalize("Hello")).toBe("Hello");
  });

  it("capitalizes a single character", () => {
    expect(capitalize("a")).toBe("A");
  });
});

describe("formatActionLabel", () => {
  it("converts snake_case to Title Case words", () => {
    expect(formatActionLabel("user_created")).toBe("User Created");
  });

  it("handles a single word", () => {
    expect(formatActionLabel("login")).toBe("Login");
  });

  it("handles multiple underscores", () => {
    expect(formatActionLabel("api_key_deleted")).toBe("Api Key Deleted");
  });
});

describe("formatBytes", () => {
  it("returns '0 B' for 0 bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats bytes below 1 KB", () => {
    expect(formatBytes(512)).toBe("512 B");
  });

  it("formats exactly 1 KB", () => {
    expect(formatBytes(1024)).toBe("1 KB");
  });

  it("formats exactly 1 MB", () => {
    expect(formatBytes(1024 * 1024)).toBe("1 MB");
  });

  it("formats exactly 1 GB", () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe("1 GB");
  });

  it("formats fractional KB", () => {
    expect(formatBytes(1536)).toBe("1.5 KB");
  });
});

describe("maskApiKey", () => {
  it("masks all but the first 8 characters with bullet points", () => {
    const key = "abcdefgh12345678";
    const masked = maskApiKey(key);
    expect(masked.startsWith("abcdefgh")).toBe(true);
    expect(masked).toContain("•");
    expect(masked.length).toBe(8 + 24);
  });

  it("returns keys of 8 characters or fewer unchanged", () => {
    expect(maskApiKey("short")).toBe("short");
    expect(maskApiKey("exactly8")).toBe("exactly8");
  });
});
