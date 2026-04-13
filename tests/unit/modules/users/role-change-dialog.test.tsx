import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RoleChangeDialog } from "@/modules/users/components/role-change-dialog";
import type { Role } from "@/modules/roles/queries/roles.queries";
import type { User } from "@/modules/users/queries/users.queries";

const fetchRolesMock = vi.fn();
const changeUserRoleMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("@/modules/roles/queries/roles.queries", () => ({
  fetchRoles: (...args: unknown[]) => fetchRolesMock(...args),
}));

vi.mock("@/modules/users/queries/users.queries", () => ({
  changeUserRole: (...args: unknown[]) => changeUserRoleMock(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

const roles: Role[] = [
  {
    id: "role-1",
    name: "panel_admin",
    description: "Admin role",
    is_system: true,
    permissions: ["users.read.basic"],
  },
  {
    id: "role-2",
    name: "support_agent",
    description: "Support role",
    is_system: false,
    permissions: ["users.read.basic"],
  },
];

const firstUser: User = {
  id: "user-1",
  email: "admin@example.com",
  username: "admin",
  full_name: "Admin User",
  avatar_url: null,
  surface: "admin",
  role: {
    id: "role-1",
    name: "panel_admin",
    is_system: true,
  },
  is_active: true,
  is_verified: true,
  has_pending_email: false,
  verification_required: false,
};

const secondUser: User = {
  id: "user-2",
  email: "support@example.com",
  username: "support",
  full_name: "Support User",
  avatar_url: null,
  surface: "admin",
  role: {
    id: "role-2",
    name: "support_agent",
    is_system: false,
  },
  is_active: true,
  is_verified: true,
  has_pending_email: false,
  verification_required: false,
};

describe("RoleChangeDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchRolesMock.mockResolvedValue(roles);
  });

  it("resets the selected role when reopened for a different user", async () => {
    const wrapper = createWrapper();

    const { rerender } = render(
      <RoleChangeDialog
        open
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
        user={firstUser}
      />,
      { wrapper },
    );

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toHaveTextContent("panel_admin");
    });

    rerender(
      <RoleChangeDialog
        open={false}
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
        user={firstUser}
      />,
    );

    rerender(
      <RoleChangeDialog
        open
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
        user={secondUser}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toHaveTextContent("support_agent");
    });
  });
});
