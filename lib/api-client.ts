import createClient from "openapi-fetch";
import type { paths } from "@/types/api.generated";
import { waitForLocaleSwitch } from "@/shared/lib/locale-switch";

export const apiClient = createClient<paths>({
  baseUrl: "",
  credentials: "include",
});

// Promise-based queue: all concurrent 401s await the same refresh call
let refreshPromise: Promise<boolean> | null = null;
let isRedirecting = false;
const retryableRequests = new WeakMap<Request, Request>();

apiClient.use({
  async onRequest({ request }) {
    await waitForLocaleSwitch();
    retryableRequests.set(request, request.clone());
    return request;
  },
  async onResponse({ response, request }) {
    if (response.status !== 401 || isRedirecting) {
      retryableRequests.delete(request);
      return response;
    }

    // Share a single in-flight refresh across concurrent failures
    if (!refreshPromise) {
      refreshPromise = waitForLocaleSwitch()
        .then(() =>
          fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
          }),
        )
        .then((r) => r.ok)
        .catch(() => false)
        .finally(() => {
          refreshPromise = null;
        });
    }

    const refreshed = await refreshPromise;

    if (!refreshed) {
      retryableRequests.delete(request);
      if (typeof window !== "undefined" && !isRedirecting) {
        isRedirecting = true;
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
      return response;
    }

    // Retry the original request after token refresh
    await waitForLocaleSwitch();
    const retryRequest = retryableRequests.get(request) ?? request;
    retryableRequests.delete(request);
    return fetch(retryRequest, { credentials: "include" });
  },
});
