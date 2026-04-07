import {
  clearAuthCookies,
  createJsonProxyResponse,
  forwardToFastApi,
  getRefreshTokenFromCookies,
} from "@/lib/server-auth";

export async function POST() {
  const refreshToken = await getRefreshTokenFromCookies();

  if (!refreshToken) {
    await clearAuthCookies();
    return Response.json({ success: true });
  }

  const response = await forwardToFastApi("/api/v1/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  await clearAuthCookies();

  if (!response.ok) {
    return createJsonProxyResponse(response);
  }

  return Response.json({ success: true });
}
