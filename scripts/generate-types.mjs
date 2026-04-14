import { spawnSync } from "node:child_process";
import { loadLocalEnv } from "./load-env.mjs";

loadLocalEnv(process.cwd());

const fastApiUrl =
  process.env.NEXT_PUBLIC_FASTAPI_URL?.replace(/\/+$/, "") ||
  "http://127.0.0.1:8000";
const schemaUrl =
  process.env.OPENAPI_SCHEMA_URL || `${fastApiUrl}/schema/admin/openapi.json`;

const result = spawnSync(
  process.platform === "win32" ? "pnpm.cmd" : "pnpm",
  ["exec", "openapi-typescript", schemaUrl, "-o", "types/api.generated.ts"],
  {
    stdio: "inherit",
    shell: false,
  },
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 0);
