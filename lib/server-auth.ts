export {
  clearAuthCookies,
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
  setAuthCookies,
} from "@/lib/auth/cookies";
export {
  createJsonProxyResponse,
  forwardToFastApi,
  proxyApiRequestToFastApi,
} from "@/lib/auth/fastapi";
export {
  createInternalAuthErrorResponse,
  exchangeTokens,
  finalizeAuthResponse,
  isPartialAuthResponse,
  type PartialAuthResponse,
} from "@/lib/auth/token-exchange";
export {
  getServerCurrentUser,
  requireAdminSurface,
  requireAuthenticatedUser,
  requireNamedPageAccess,
  requirePageAccess,
  resolveServerAuthzSnapshot,
} from "@/lib/auth/server-access";
