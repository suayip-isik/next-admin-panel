import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminError from "@/app/(admin)/error";
import ForbiddenPage from "@/app/forbidden";
import GlobalError from "@/app/global-error";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(
    async () => (key: string) =>
      ({
        code: "403",
        title: "Forbidden",
        description: "You do not have access.",
        backToDashboard: "Back to dashboard",
      })[key],
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("app error boundaries", () => {
  it("renders the forbidden page with translated copy", async () => {
    const page = await ForbiddenPage();
    render(page);

    expect(screen.getByText("403")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Forbidden" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to dashboard" }),
    ).toHaveAttribute("href", "/dashboard");
  });

  it("renders the global error boundary, logs the error, and prefers unstable_retry", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const reset = vi.fn();
    const unstableRetry = vi.fn();
    const error = Object.assign(new Error("boom"), { digest: "digest-1" });

    render(
      <GlobalError
        error={error}
        reset={reset}
        unstable_retry={unstableRetry}
      />,
    );

    await waitFor(() => expect(consoleErrorSpy).toHaveBeenCalledWith(error));
    expect(screen.getByText(/digest: digest-1/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(unstableRetry).toHaveBeenCalledTimes(1);
    expect(reset).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("falls back to reset in the admin segment error boundary", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const reset = vi.fn();
    const error = new Error("admin");

    render(<AdminError error={error} reset={reset} />);

    await waitFor(() => expect(consoleErrorSpy).toHaveBeenCalledWith(error));
    expect(screen.queryByText(/digest:/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(reset).toHaveBeenCalledTimes(1);

    consoleErrorSpy.mockRestore();
  });
});
