import { describe, it, expect } from "vitest";
import { AppError, parseApiError } from "@/lib/errors";

describe("AppError", () => {
  it("creates an error with correct properties", () => {
    const err = new AppError(404, "NOT_FOUND", "Resource not found", {
      id: "123",
    });
    expect(err.status).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("Resource not found");
    expect(err.details).toEqual({ id: "123" });
    expect(err.name).toBe("AppError");
  });

  it("is an instance of both AppError and Error", () => {
    const err = new AppError(500, "SERVER_ERROR", "Internal error");
    expect(err instanceof Error).toBe(true);
    expect(err instanceof AppError).toBe(true);
  });

  it("works without details", () => {
    const err = new AppError(401, "UNAUTHORIZED", "Not authenticated");
    expect(err.details).toBeUndefined();
  });
});

describe("parseApiError", () => {
  it("parses body.error with code and message", () => {
    const err = parseApiError(400, {
      error: {
        code: "BAD_REQUEST",
        message: "Invalid input",
        details: { field: "email" },
      },
    });
    expect(err.status).toBe(400);
    expect(err.code).toBe("BAD_REQUEST");
    expect(err.message).toBe("Invalid input");
    expect(err.details).toEqual({ field: "email" });
  });

  it("uses UNKNOWN_ERROR when error.code is missing", () => {
    const err = parseApiError(400, { error: { message: "Oops" } });
    expect(err.code).toBe("UNKNOWN_ERROR");
    expect(err.message).toBe("Oops");
  });

  it("parses string detail", () => {
    const err = parseApiError(401, { detail: "Not authenticated" });
    expect(err.code).toBe("API_ERROR");
    expect(err.message).toBe("Not authenticated");
    expect(err.status).toBe(401);
  });

  it("parses array detail (FastAPI/Pydantic validation errors)", () => {
    const err = parseApiError(422, {
      detail: [
        { msg: "field required", loc: ["body", "email"] },
        { msg: "invalid email", loc: ["body", "email"] },
      ],
    });
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.message).toBe("field required, invalid email");
    expect(Array.isArray(err.details)).toBe(true);
  });

  it("falls back to UNKNOWN_ERROR when body has no known shape", () => {
    const err = parseApiError(500, {});
    expect(err.code).toBe("UNKNOWN_ERROR");
    expect(err.status).toBe(500);
    expect(err.message).toBe("An unexpected error occurred.");
  });
});
