"use client";

let localeSwitchPromise: Promise<void> | null = null;
const listeners = new Set<(isSwitching: boolean) => void>();

function emitLocaleSwitchState(isSwitching: boolean) {
  for (const listener of listeners) {
    listener(isSwitching);
  }
}

export function subscribeToLocaleSwitch(
  listener: (isSwitching: boolean) => void,
) {
  listeners.add(listener);
  listener(localeSwitchPromise !== null);

  return () => {
    listeners.delete(listener);
  };
}

export function isLocaleSwitchInProgress() {
  return localeSwitchPromise !== null;
}

export async function waitForLocaleSwitch() {
  if (typeof window === "undefined" || !localeSwitchPromise) {
    return;
  }

  await localeSwitchPromise;
}

export function runLocaleSwitch(task: () => Promise<void>) {
  if (localeSwitchPromise) {
    return localeSwitchPromise;
  }

  emitLocaleSwitchState(true);
  localeSwitchPromise = (async () => {
    try {
      await task();
    } catch (error) {
      localeSwitchPromise = null;
      emitLocaleSwitchState(false);
      throw error;
    }
  })();

  return localeSwitchPromise;
}
