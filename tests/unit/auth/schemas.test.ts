import { describe, it, expect } from "vitest";
import {
  createLoginSchema,
  createTotpChallengeSchema,
  createForgotPasswordSchema,
  createResetPasswordSchema,
} from "@/modules/auth/schemas/auth.schemas";

const t = (key: string, params?: Record<string, string | number>) =>
  params ? `${key}:${JSON.stringify(params)}` : key;

describe("createLoginSchema", () => {
  const schema = createLoginSchema(t);

  it("accepts a valid email and password", () => {
    const result = schema.safeParse({
      email: "admin@example.com",
      password: "secret",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email format", () => {
    const result = schema.safeParse({
      email: "not-an-email",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = schema.safeParse({
      email: "admin@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing email", () => {
    const result = schema.safeParse({ password: "secret" });
    expect(result.success).toBe(false);
  });
});

describe("createTotpChallengeSchema", () => {
  const schema = createTotpChallengeSchema(t);

  it("accepts a 6-digit code", () => {
    const result = schema.safeParse({ code: "123456" });
    expect(result.success).toBe(true);
  });

  it("accepts an 8-character backup code", () => {
    const result = schema.safeParse({ code: "ABCD1234" });
    expect(result.success).toBe(true);
  });

  it("rejects a code shorter than 6 characters", () => {
    const result = schema.safeParse({ code: "12345" });
    expect(result.success).toBe(false);
  });

  it("rejects a code longer than 8 characters", () => {
    const result = schema.safeParse({ code: "123456789" });
    expect(result.success).toBe(false);
  });

  it("does not include partial_token in the schema (removed)", () => {
    // partial_token is no longer part of the schema — extra fields are stripped
    const result = schema.safeParse({ code: "123456", partial_token: "abc" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect("partial_token" in result.data).toBe(false);
    }
  });
});

describe("createForgotPasswordSchema", () => {
  const schema = createForgotPasswordSchema(t);

  it("accepts a valid email", () => {
    const result = schema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = schema.safeParse({ email: "bad" });
    expect(result.success).toBe(false);
  });
});

describe("createResetPasswordSchema", () => {
  const schema = createResetPasswordSchema(t);

  it("accepts valid matching passwords", () => {
    const result = schema.safeParse({
      token: "reset-token-abc",
      new_password: "newpassword1",
      confirm_password: "newpassword1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when passwords do not match", () => {
    const result = schema.safeParse({
      token: "reset-token-abc",
      new_password: "newpassword1",
      confirm_password: "different",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = schema.safeParse({
      token: "reset-token-abc",
      new_password: "short",
      confirm_password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing token", () => {
    const result = schema.safeParse({
      new_password: "newpassword1",
      confirm_password: "newpassword1",
    });
    expect(result.success).toBe(false);
  });
});
