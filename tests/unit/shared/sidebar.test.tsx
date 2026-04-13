import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "@/shared/components/layout/sidebar";

const pathnameMock = vi.fn();
const permissionGateMock = vi.fn();

vi.mock("next/navigation", async () => {
  const actual =
    await vi.importActual<typeof import("next/navigation")>("next/navigation");

  return {
    ...actual,
    usePathname: () => pathnameMock(),
  };
});

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/shared/hooks/use-permissions", () => ({
  usePermissionGate: (...args: unknown[]) => permissionGateMock(...args),
}));

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pathnameMock.mockReturnValue("/users");
  });

  it("renders only items allowed by permission config", () => {
    permissionGateMock.mockImplementation((check?: { all?: string[] }) => {
      const allowed = !check || check.all?.[0] !== "roles.list";
      return {
        isAllowed: allowed,
        isLoading: false,
        status: allowed ? "allowed" : "denied",
      };
    });

    render(<Sidebar />);

    expect(screen.getByRole("link", { name: "users" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "roles" }),
    ).not.toBeInTheDocument();
  });
});
