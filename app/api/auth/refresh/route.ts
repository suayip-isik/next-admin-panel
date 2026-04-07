import {
  clearAuthCookies,
  createJsonProxyResponse,
  forwardToFastApi,
  getRefreshTokenFromCookies,
  setAuthCookies,
} from "@/lib/server-auth";

export async function POST() {
  const refreshToken = await getRefreshTokenFromCookies();

  if (!refreshToken) {
    await clearAuthCookies();
    return Response.json(
      {
        error: {
          code: "UNAUTHENTICATED",
          message: "Refresh token is missing.",
        },
      },
      { status: 401 },
    );
  }

  const response = await forwardToFastApi("/api/v1/auth/refresh", {
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
    return Response.json(
      {
        error: {
          code: "INVALID_AUTH_RESPONSE",
          message: "Auth provider returned an unexpected response.",
          details: body,
        },
      },
      { status: 502 },
    );
  }

  await setAuthCookies({
    access_token: body.access_token,
    refresh_token: body.refresh_token,
  });

  return Response.json({ success: true });
}
