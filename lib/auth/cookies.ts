import { cookies } from "next/headers";
import { getAuthCookieConfig } from "@/lib/env";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

function getCookieOptions(maxAge: number) {
  const authEnv = getAuthCookieConfig();

  return {
    httpOnly: true,
    sameSite: authEnv.cookieSameSite,
    secure: authEnv.cookieSecure,
    path: authEnv.cookiePath,
    maxAge,
  };
}

export async function setAuthCookies(tokens: TokenResponse) {
  const authEnv = getAuthCookieConfig();
  const cookieStore = await cookies();
  cookieStore.set(
    authEnv.accessCookieName,
    tokens.access_token,
    getCookieOptions(authEnv.accessTokenMaxAgeSeconds),
  );
  cookieStore.set(
    authEnv.refreshCookieName,
    tokens.refresh_token,
    getCookieOptions(authEnv.refreshTokenMaxAgeSeconds),
  );
}

export async function clearAuthCookies() {
  const authEnv = getAuthCookieConfig();
  const cookieStore = await cookies();
  cookieStore.delete(authEnv.accessCookieName);
  cookieStore.delete(authEnv.refreshCookieName);
}

export async function getRefreshTokenFromCookies() {
  const authEnv = getAuthCookieConfig();
  const cookieStore = await cookies();
  return cookieStore.get(authEnv.refreshCookieName)?.value ?? null;
}

export async function getAccessTokenFromCookies() {
  const authEnv = getAuthCookieConfig();
  const cookieStore = await cookies();
  return cookieStore.get(authEnv.accessCookieName)?.value ?? null;
}
