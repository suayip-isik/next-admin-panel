import {
  clearAuthCookies,
  forwardToFastApi,
  getRefreshTokenFromCookies,
} from "@/lib/server-auth";
import { withNoStoreApiHeaders } from "@/lib/security";

export async function POST() {
  const refreshToken = await getRefreshTokenFromCookies();

  if (!refreshToken) {
    await clearAuthCookies();
    return withNoStoreApiHeaders(Response.json({ success: true }));
  }

  try {
    await forwardToFastApi("/api/v1/shared/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch {
    // Local logout is enough once auth cookies are cleared.
  } finally {
    await clearAuthCookies();
  }

  return withNoStoreApiHeaders(Response.json({ success: true }));
}
