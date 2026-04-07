import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
} from "@/shared/utils/date";

describe("formatDate", () => {
  it("returns em-dash for null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("returns em-dash for undefined", () => {
    expect(formatDate(undefined)).toBe("—");
  });

  it("returns em-dash for an invalid date string", () => {
    expect(formatDate("not-a-date")).toBe("—");
  });

  it("formats a valid ISO date string", () => {
    const result = formatDate("2024-01-15T00:00:00.000Z", "en");
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/2024/);
  });

  it("accepts a Date object", () => {
    const result = formatDate(new Date("2024-06-01T00:00:00.000Z"), "en");
    expect(result).toMatch(/2024/);
  });
});

describe("formatDateTime", () => {
  it("returns em-dash for null", () => {
    expect(formatDateTime(null)).toBe("—");
  });

  it("returns em-dash for undefined", () => {
    expect(formatDateTime(undefined)).toBe("—");
  });

  it("returns em-dash for an invalid date string", () => {
    expect(formatDateTime("bad-date")).toBe("—");
  });

  it("formats a valid date with month and year components", () => {
    const result = formatDateTime("2024-03-20T10:30:00.000Z", "en");
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/Mar/);
  });
});

describe("formatRelativeTime", () => {
  it("returns em-dash for null", () => {
    expect(formatRelativeTime(null)).toBe("—");
  });

  it("returns em-dash for undefined", () => {
    expect(formatRelativeTime(undefined)).toBe("—");
  });

  it("returns em-dash for an invalid date string", () => {
    expect(formatRelativeTime("bad")).toBe("—");
  });

  it("returns a non-empty string for a recent date", () => {
    const recent = new Date(Date.now() - 60 * 1000).toISOString(); // 1 min ago
    const result = formatRelativeTime(recent, "en");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toBe("—");
  });

  it("returns a date string for dates older than 30 days", () => {
    const old = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(old, "en");
    // Older than 30 days falls back to formatDate format
    expect(typeof result).toBe("string");
    expect(result).not.toBe("—");
  });
});
