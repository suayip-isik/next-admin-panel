import { beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { setLocale } from "@/shared/actions/set-locale";

describe("setLocale", () => {
  const cookieStore = {
    set: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockResolvedValue(cookieStore as never);
  });

  it("stores supported locales in the locale cookie", async () => {
    await setLocale("tr");

    expect(cookieStore.set).toHaveBeenCalledWith(
      "NEXT_LOCALE",
      "tr",
      expect.objectContaining({
        path: "/",
        sameSite: "lax",
      }),
    );
  });

  it("ignores unsupported locales", async () => {
    await setLocale("de");

    expect(cookieStore.set).not.toHaveBeenCalled();
  });
});
