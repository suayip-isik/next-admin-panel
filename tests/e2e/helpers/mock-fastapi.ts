import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";

const MOCK_FASTAPI_ORIGIN =
  process.env.PLAYWRIGHT_FASTAPI_URL ??
  process.env.NEXT_PUBLIC_FASTAPI_URL ??
  "http://127.0.0.1:18000";
const MOCK_FASTAPI_PORT = Number(new URL(MOCK_FASTAPI_ORIGIN).port || "80");

type LoginMode = "success" | "totp";

type MockRole = {
  id: string;
  name: string;
  description?: string;
  is_system: boolean;
  permissions?: string[];
};

type MockCurrentUser = {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  surface: "admin";
  permissions: string[];
  role: MockRole;
  is_active: boolean;
  is_verified: boolean;
  has_pending_email: boolean;
  verification_required: boolean;
};

type MockFastApiState = {
  createdPayload: Record<string, unknown> | null;
  forceRefreshFailure: boolean;
  forceUsersUnauthorized: boolean;
  loginMode: LoginMode;
  logoutCalls: number;
  roleDetail: MockRole;
  roles: MockRole[];
  stats: {
    total: number;
    active: number;
    inactive: number;
  };
  unreadCount: number;
  users: Array<Record<string, unknown>>;
  currentUser: MockCurrentUser;
};

function createBaseRole(): MockRole {
  return {
    id: "role-admin",
    name: "panel_admin",
    description: "Administrators",
    is_system: true,
    permissions: [
      "users.list",
      "users.read.basic",
      "users.read.stats",
      "users.create.admin",
      "users.update.role",
      "profile.read.self",
      "notifications.read.unread_count",
    ],
  };
}

export function createCurrentUser(
  overrides: Partial<MockCurrentUser> = {},
): MockCurrentUser {
  const {
    permissions: ignoredPermissions,
    role: ignoredRole,
    ...rest
  } = overrides;
  const role = {
    ...createBaseRole(),
    ...ignoredRole,
  };
  const permissions = ignoredPermissions ?? role.permissions ?? [];

  return {
    id: "me-1",
    email: "admin@example.com",
    username: "admin",
    full_name: "Admin User",
    avatar_url: null,
    surface: "admin",
    is_active: true,
    is_verified: true,
    has_pending_email: false,
    verification_required: false,
    ...rest,
    role,
    permissions,
  };
}

function createDefaultState(): MockFastApiState {
  const role = createBaseRole();
  return {
    createdPayload: null,
    forceRefreshFailure: false,
    forceUsersUnauthorized: false,
    loginMode: "success",
    logoutCalls: 0,
    roleDetail: role,
    roles: [
      role,
      {
        id: "role-support",
        name: "support",
        description: "Support agents",
        is_system: false,
        permissions: ["users.read.basic", "profile.read.self"],
      },
    ],
    stats: {
      total: 12,
      active: 10,
      inactive: 2,
    },
    unreadCount: 0,
    users: [
      {
        id: "user-1",
        email: "alice@example.com",
        username: "alice",
        full_name: "Alice Admin",
        avatar_url: null,
        surface: "admin",
        role: {
          id: "role-admin",
          name: "panel_admin",
          is_system: true,
        },
        is_active: true,
        is_verified: true,
        has_pending_email: false,
        verification_required: false,
      },
    ],
    currentUser: createCurrentUser(),
  };
}

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

function readJsonBody(request: IncomingMessage) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk.toString();
    });
    request.on("end", () => {
      try {
        resolve(body ? (JSON.parse(body) as Record<string, unknown>) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function hasBearerToken(request: IncomingMessage) {
  const authorization = request.headers.authorization;
  return (
    typeof authorization === "string" && authorization.startsWith("Bearer ")
  );
}

function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith("/api/v1/admin/") ||
    pathname.startsWith("/api/v1/shared/")
  );
}

export async function startMockFastApiServer() {
  let state = createDefaultState();

  const httpServer = createServer(
    async (request: IncomingMessage, response: ServerResponse) => {
      const url = new URL(request.url ?? "/", MOCK_FASTAPI_ORIGIN);

      if (
        isProtectedPath(url.pathname) &&
        ![
          "/api/v1/admin/auth/login",
          "/api/v1/shared/auth/totp-challenge",
          "/api/v1/shared/auth/refresh",
        ].includes(url.pathname) &&
        !hasBearerToken(request)
      ) {
        sendJson(response, 401, {
          error: {
            code: "UNAUTHENTICATED",
            message: "Missing bearer token.",
          },
        });
        return;
      }

      if (
        request.method === "POST" &&
        url.pathname === "/api/v1/admin/auth/login"
      ) {
        if (state.loginMode === "totp") {
          sendJson(response, 200, {
            requires_totp: true,
            partial_token: "partial-token-123",
          });
          return;
        }

        sendJson(response, 200, {
          access_token: "test-access-token",
          refresh_token: "test-refresh-token",
          token_type: "bearer",
        });
        return;
      }

      if (
        request.method === "POST" &&
        url.pathname === "/api/v1/shared/auth/totp-challenge"
      ) {
        sendJson(response, 200, {
          access_token: "test-access-token",
          refresh_token: "test-refresh-token",
          token_type: "bearer",
        });
        return;
      }

      if (
        request.method === "POST" &&
        url.pathname === "/api/v1/shared/auth/refresh"
      ) {
        if (state.forceRefreshFailure) {
          sendJson(response, 401, {
            error: {
              code: "INVALID_TOKEN",
              message: "Refresh token is invalid.",
            },
          });
          return;
        }

        sendJson(response, 200, {
          access_token: "refreshed-access-token",
          refresh_token: "refreshed-refresh-token",
        });
        return;
      }

      if (
        request.method === "POST" &&
        url.pathname === "/api/v1/shared/auth/logout"
      ) {
        state.logoutCalls += 1;
        sendJson(response, 200, { success: true });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/v1/shared/me") {
        sendJson(response, 200, state.currentUser);
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/api/v1/shared/notifications/unread-count"
      ) {
        sendJson(response, 200, { count: state.unreadCount });
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/api/v1/admin/users/stats"
      ) {
        if (state.forceUsersUnauthorized) {
          sendJson(response, 401, {
            error: {
              code: "TOKEN_EXPIRED",
              message: "Access token expired.",
            },
          });
          return;
        }

        sendJson(response, 200, state.stats);
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/v1/admin/roles") {
        sendJson(response, 200, state.roles);
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === `/api/v1/admin/roles/${state.roleDetail.id}`
      ) {
        sendJson(response, 200, state.roleDetail);
        return;
      }

      if (url.pathname === "/api/v1/admin/users" && request.method === "POST") {
        state.createdPayload = await readJsonBody(request);
        sendJson(response, 201, {
          id: "user-new",
          email: "new-admin@example.com",
          username: "new_admin",
          full_name: "New Admin",
          avatar_url: null,
          surface: "admin",
          role: {
            id: "role-admin",
            name: "panel_admin",
            is_system: true,
          },
          is_active: true,
          is_verified: false,
          has_pending_email: false,
          verification_required: true,
        });
        return;
      }

      if (url.pathname === "/api/v1/admin/users" && request.method === "GET") {
        if (state.forceUsersUnauthorized) {
          sendJson(response, 401, {
            error: {
              code: "TOKEN_EXPIRED",
              message: "Access token expired.",
            },
          });
          return;
        }

        sendJson(response, 200, {
          items: state.users,
          total: state.users.length,
          page: 1,
          size: 20,
          pages: 1,
        });
        return;
      }

      sendJson(response, 404, {
        detail: `${request.method} ${url.pathname} is not mocked`,
      });
    },
  );

  await new Promise<void>((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(MOCK_FASTAPI_PORT, () => {
      httpServer.off("error", reject);
      resolve();
    });
  });

  return {
    close: () =>
      new Promise<void>((resolve, reject) => {
        httpServer.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }),
    getCreatedPayload: () => state.createdPayload,
    getLogoutCalls: () => state.logoutCalls,
    reset: () => {
      state = createDefaultState();
    },
    setCurrentUser: (nextUser: MockCurrentUser) => {
      state.currentUser = nextUser;
      state.roleDetail = {
        ...state.roleDetail,
        ...(nextUser.role ?? {}),
        permissions: nextUser.role.permissions ?? nextUser.permissions,
      };
    },
    setForceRefreshFailure: (value: boolean) => {
      state.forceRefreshFailure = value;
    },
    setForceUsersUnauthorized: (value: boolean) => {
      state.forceUsersUnauthorized = value;
    },
    setLoginMode: (mode: LoginMode) => {
      state.loginMode = mode;
    },
  };
}
