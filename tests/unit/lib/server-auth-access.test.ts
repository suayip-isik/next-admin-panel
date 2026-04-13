import { beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { requireNamedPageAccess } from "@/lib/server-auth";

const redirectMock = vi.fn((path: string) => {
  throw new Error(`redirect:${path}`);
});
const forbiddenMock = vi.fn(() => {
  throw new Error("forbidden");
});

vi.mock("next/navigation", async () => {
  const actual =
    await vi.importActual<typeof import("next/navigation")>("next/navigation");

  return {
    ...actual,
    redirect: (path: string) => redirectMock(path),
    forbidden: () => forbiddenMock(),
  };
});

type CookieStore = {
  get: ReturnType<typeof vi.fn>;
  getAll: ReturnType<typeof vi.fn>;
  has: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  size: number;
  [Symbol.iterator]: () => IterableIterator<never>;
};

function createCookieStore(): CookieStore {
  return {
    get: vi.fn(),
    getAll: vi.fn(() => []),
    has: vi.fn(() => false),
    set: vi.fn(),
    delete: vi.fn(),
    size: 0,
    [Symbol.iterator]: function* () {
      return;
    },
  };
}

describe("requireNamedPageAccess", () => {
  let cookieStore: CookieStore;

  beforeEach(() => {
    vi.clearAllMocks();
    cookieStore = createCookieStore();
    vi.mocked(cookies).mockResolvedValue(cookieStore as never);
  });

  it("redirects unauthenticated users to login", async () => {
    cookieStore.get.mockReturnValue(undefined);

    await expect(requireNamedPageAccess("usersList")).rejects.toThrow(
      "redirect:/login",
    );
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("forbids access when required permissions are missing", async () => {
    cookieStore.get.mockImplementation((name: string) => {
      if (name === "access_token") return { value: "access-1" };
      return undefined;
    });

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: "user-1",
          email: "admin@example.com",
          username: "admin",
          full_name: "Admin",
          avatar_url: null,
          surface: "admin",
          permissions: ["users.list"],
          role: {
            id: "role-1",
            name: "panel_admin",
            is_system: true,
          },
          is_active: true,
          is_verified: true,
          has_pending_email: false,
          verification_required: false,
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    await expect(requireNamedPageAccess("roleDetail")).rejects.toThrow(
      "forbidden",
    );
    expect(forbiddenMock).toHaveBeenCalled();
  });
});
