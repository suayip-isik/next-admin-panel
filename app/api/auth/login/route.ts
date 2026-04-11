import {
  createJsonProxyResponse,
  finalizeAuthResponse,
  forwardToFastApi,
  isPartialAuthResponse,
} from "@/lib/server-auth";

export async function POST(request: Request) {
  const payload = await request.json();
  const response = await forwardToFastApi("/api/v1/admin/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return createJsonProxyResponse(response);
  }

  const body = await response.json();

  if (isPartialAuthResponse(body)) {
    return Response.json(body);
  }

  return finalizeAuthResponse(body);
}
