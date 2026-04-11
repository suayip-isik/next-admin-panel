import { exchangeTokens } from "@/lib/server-auth";

export async function POST(request: Request) {
  const payload = await request.json();
  return exchangeTokens("/api/v1/shared/auth/totp-challenge", payload);
}
