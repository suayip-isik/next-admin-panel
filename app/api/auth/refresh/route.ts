import {
  clearAuthCookies,
  createInternalAuthErrorResponse,
  createJsonProxyResponse,
  forwardToFastApi,
  getRefreshTokenFromCookies,
  setAuthCookies,
} from "@/lib/server-auth";

export async function POST() {
  const refreshToken = await getRefreshTokenFromCookies();

  if (!refreshToken) {
    await clearAuthCookies();
    return createInternalAuthErrorResponse(401, "UNAUTHENTICATED");
  }

  const response = await forwardToFastApi("/api/v1/shared/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    await clearAuthCookies();
    return createJsonProxyResponse(response);
  }

  const body = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
  };

  if (!body.access_token || !body.refresh_token) {
    await clearAuthCookies();
    return createInternalAuthErrorResponse(502, "INVALID_AUTH_RESPONSE", body);
  }

  await setAuthCookies({
    access_token: body.access_token,
    refresh_token: body.refresh_token,
  });

  return Response.json({ success: true });
}
