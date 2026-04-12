import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RoleFormDialog } from "@/modules/roles/components/role-form-dialog";
import type { Role } from "@/modules/roles/queries/roles.queries";

const createRoleMock = vi.fn();
const updateRoleMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("@/modules/roles/queries/roles.queries", () => ({
  createRole: (...args: unknown[]) => createRoleMock(...args),
  updateRole: (...args: unknown[]) => updateRoleMock(...args),
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

const firstRole: Role = {
  id: "role-1",
  name: "panel_admin",
  description: "Admin role",
  is_system: true,
  permissions: ["users:view", "roles:update"],
};

const secondRole: Role = {
  id: "role-2",
  name: "support_agent",
  description: "Support role",
  is_system: false,
  permissions: ["users:view"],
};

describe("RoleFormDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resets form values when opened for a different role", async () => {
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();
    const wrapper = createWrapper();

    const { rerender } = render(
      <RoleFormDialog
        open
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
        role={firstRole}
      />,
      { wrapper },
    );

    expect(screen.getByLabelText("form.description")).toHaveValue("Admin role");

    rerender(
      <RoleFormDialog
        open
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
        role={secondRole}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("form.description")).toHaveValue(
        "Support role",
      );
    });
  });

  it("does not carry edit state into create mode", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();

    const { rerender } = render(
      <RoleFormDialog
        open
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
        role={firstRole}
      />,
      { wrapper },
    );

    const descriptionInput = screen.getByLabelText("form.description");
    await user.clear(descriptionInput);
    await user.type(descriptionInput, "Unsaved changes");

    rerender(
      <RoleFormDialog open onOpenChange={vi.fn()} onSuccess={vi.fn()} />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("form.name")).toHaveValue("");
      expect(screen.getByLabelText("form.description")).toHaveValue("");
    });
  });

  it("shows updated values when the dialog is reopened after a successful save", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const wrapper = createWrapper();

    updateRoleMock.mockResolvedValue(undefined);

    const { rerender } = render(
      <RoleFormDialog
        open
        onOpenChange={vi.fn()}
        onSuccess={onSuccess}
        role={firstRole}
      />,
      { wrapper },
    );

    const descriptionInput = screen.getByLabelText("form.description");
    await user.clear(descriptionInput);
    await user.type(descriptionInput, "Updated admin role");
    await user.click(screen.getByRole("button", { name: "form.submit" }));

    await waitFor(() => {
      expect(updateRoleMock).toHaveBeenCalledWith("role-1", {
        description: "Updated admin role",
        permissions: ["users:view", "roles:update"],
      });
    });

    expect(onSuccess).toHaveBeenCalled();

    rerender(
      <RoleFormDialog
        open={false}
        onOpenChange={vi.fn()}
        onSuccess={onSuccess}
        role={firstRole}
      />,
    );

    rerender(
      <RoleFormDialog
        open
        onOpenChange={vi.fn()}
        onSuccess={onSuccess}
        role={{ ...firstRole, description: "Updated admin role" }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("form.description")).toHaveValue(
        "Updated admin role",
      );
    });
  });
});
