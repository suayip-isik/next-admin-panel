const SAFE_PATH_PREFIX = "/";

export const PARTIAL_TOKEN_STORAGE_KEY = "partial_token";
export const POST_LOGIN_REDIRECT_STORAGE_KEY = "post_login_redirect";

export function normalizeReturnPath(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (
    trimmed.length === 0 ||
    !trimmed.startsWith(SAFE_PATH_PREFIX) ||
    trimmed.startsWith("//")
  ) {
    return null;
  }

  try {
    const url = new URL(trimmed, "http://localhost");
    if (url.origin !== "http://localhost") {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
