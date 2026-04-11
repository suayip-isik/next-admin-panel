import { getAppUrl, getDeployEnvironment } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    {
      status: "ok",
      environment: getDeployEnvironment(),
      appUrl: getAppUrl(),
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
