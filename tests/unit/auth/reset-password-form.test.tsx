import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/errors";
import { ResetPasswordForm } from "@/modules/auth/components/reset-password-form";

const pushMock = vi.fn();
const getSearchParamMock = vi.fn<(key: string) => string | null>();
const resetPasswordMutationMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("next/navigation", async () => {
  const actual =
    await vi.importActual<typeof import("next/navigation")>("next/navigation");

  return {
    ...actual,
    useRouter: vi.fn(() => ({
      push: pushMock,
      replace: vi.fn(),
      back: vi.fn(),
      prefetch: vi.fn(),
      refresh: vi.fn(),
    })),
    useSearchParams: vi.fn(() => ({
      get: getSearchParamMock,
    })),
  };
});

vi.mock("@/modules/auth/queries/auth.queries", () => ({
  resetPasswordMutation: (...args: unknown[]) =>
    resetPasswordMutationMock(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSearchParamMock.mockImplementation((key: string) =>
      key === "token" ? "reset-token-123" : null,
    );
  });

  it("renders an inline error when the token is missing", () => {
    getSearchParamMock.mockReturnValue(null);

    render(<ResetPasswordForm />);

    expect(screen.getByText("errors.missingToken")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "requestNewLink" }),
    ).toHaveAttribute("href", "/forgot-password");
  });

  it("submits only token and new_password to the API", async () => {
    const user = userEvent.setup();
    resetPasswordMutationMock.mockResolvedValue(undefined);

    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("password"), "NewSecure123!");
    await user.type(screen.getByLabelText("confirmPassword"), "NewSecure123!");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(resetPasswordMutationMock).toHaveBeenCalledWith({
        token: "reset-token-123",
        new_password: "NewSecure123!",
        confirm_password: "NewSecure123!",
      });
    });

    expect(toastSuccessMock).toHaveBeenCalledWith("successMessage");
    expect(
      screen.getByRole("button", { name: "backToLogin" }),
    ).toBeInTheDocument();
  });

  it("shows an inline error and forgot-password CTA for invalid tokens", async () => {
    const user = userEvent.setup();
    resetPasswordMutationMock.mockRejectedValue(
      new AppError(400, "TOKEN_EXPIRED", "Expired"),
    );

    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("password"), "NewSecure123!");
    await user.type(screen.getByLabelText("confirmPassword"), "NewSecure123!");
    await user.click(screen.getByRole("button", { name: "submit" }));

    expect(await screen.findByText("errors.invalidToken")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "requestNewLink" }),
    ).toHaveAttribute("href", "/forgot-password");
    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  it("shows backend validation details inline for 422 errors", async () => {
    const user = userEvent.setup();
    resetPasswordMutationMock.mockRejectedValue(
      new AppError(
        422,
        "VALIDATION_ERROR",
        "Password cannot match your previous password.",
      ),
    );

    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("password"), "Newpassword1");
    await user.type(screen.getByLabelText("confirmPassword"), "Newpassword1");
    await user.click(screen.getByRole("button", { name: "submit" }));

    expect(
      await screen.findByText("Password cannot match your previous password."),
    ).toBeInTheDocument();
    expect(toastErrorMock).not.toHaveBeenCalled();
  });
});
