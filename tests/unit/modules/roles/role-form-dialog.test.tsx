import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RoleFormDialog } from "@/modules/roles/components/role-form-dialog";

const createRoleMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("@/modules/roles/queries/roles.queries", () => ({
  createRole: (...args: unknown[]) => createRoleMock(...args),
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

describe("RoleFormDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits a create request with canonical permissions", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    const onSuccess = vi.fn();

    createRoleMock.mockResolvedValue(undefined);

    render(
      <RoleFormDialog open onOpenChange={vi.fn()} onSuccess={onSuccess} />,
      { wrapper },
    );

    await user.type(screen.getByLabelText("form.name"), "support_agent");
    await user.type(screen.getByLabelText("form.description"), "Support role");
    await user.click(screen.getByText("Read User Detail"));
    await user.click(screen.getByRole("button", { name: "form.submit" }));

    await waitFor(() => {
      expect(createRoleMock).toHaveBeenCalledWith({
        name: "support_agent",
        description: "Support role",
        permissions: ["users.read.basic"],
      });
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(toastSuccessMock).toHaveBeenCalled();
  });

  it("resets create form values when reopened", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    const { rerender } = render(
      <RoleFormDialog open onOpenChange={vi.fn()} onSuccess={vi.fn()} />,
      { wrapper },
    );

    await user.type(screen.getByLabelText("form.name"), "temp_role");

    rerender(
      <RoleFormDialog
        open={false}
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );
    rerender(
      <RoleFormDialog open onOpenChange={vi.fn()} onSuccess={vi.fn()} />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("form.name")).toHaveValue("");
      expect(screen.getByLabelText("form.description")).toHaveValue("");
    });
  });
});
