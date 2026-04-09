import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  isLocaleSwitchInProgress,
  runLocaleSwitch,
  subscribeToLocaleSwitch,
  waitForLocaleSwitch,
} from "@/shared/lib/locale-switch";

describe("locale switch coordination", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("notifies listeners and resets state after a successful switch", async () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToLocaleSwitch(listener);

    await runLocaleSwitch(async () => {});

    expect(listener).toHaveBeenNthCalledWith(1, false);
    expect(listener).toHaveBeenNthCalledWith(2, true);
    expect(listener).toHaveBeenNthCalledWith(3, false);
    expect(isLocaleSwitchInProgress()).toBe(false);

    unsubscribe();
  });

  it("deduplicates concurrent switch requests", async () => {
    let resolveTask: (() => void) | null = null;

    const promise = runLocaleSwitch(
      () =>
        new Promise<void>((resolve) => {
          resolveTask = resolve;
        }),
    );

    const second = runLocaleSwitch(async () => {
      throw new Error("should not run");
    });

    expect(second).toBe(promise);
    resolveTask?.();
    await promise;
  });

  it("waits for an in-flight switch in the browser", async () => {
    vi.stubGlobal("window", window);

    let resolveTask: (() => void) | null = null;
    const switchPromise = runLocaleSwitch(
      () =>
        new Promise<void>((resolve) => {
          resolveTask = resolve;
        }),
    );

    const waiter = waitForLocaleSwitch();
    resolveTask?.();

    await Promise.all([switchPromise, waiter]);
  });
});
