import createClient from "openapi-fetch";
import type { paths } from "@/types/api.generated";

export const apiClient = createClient<paths>({
  baseUrl: "",
  credentials: "include",
});

// Promise-based queue: all concurrent 401s await the same refresh call
let refreshPromise: Promise<boolean> | null = null;
let isRedirecting = false;

apiClient.use({
  async onResponse({ response, request }) {
    if (response.status !== 401 || isRedirecting) {
      return response;
    }

    // Share a single in-flight refresh across concurrent failures
    if (!refreshPromise) {
      refreshPromise = fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      })
        .then((r) => r.ok)
        .catch(() => false)
        .finally(() => {
          refreshPromise = null;
        });
    }

    const refreshed = await refreshPromise;

    if (!refreshed) {
      if (typeof window !== "undefined" && !isRedirecting) {
        isRedirecting = true;
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
      return response;
    }

    // Retry the original request after token refresh
    return fetch(request.clone(), { credentials: "include" });
  },
});
