import { proxyApiRequestToFastApi } from "@/lib/server-auth";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function handleRequest(request: Request, context: RouteContext) {
  const { path } = await context.params;
  return proxyApiRequestToFastApi(request, `/api/v1/${path.join("/")}`);
}

export async function GET(request: Request, context: RouteContext) {
  return handleRequest(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return handleRequest(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return handleRequest(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleRequest(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleRequest(request, context);
}

export async function HEAD(request: Request, context: RouteContext) {
  return handleRequest(request, context);
}

export async function OPTIONS(request: Request, context: RouteContext) {
  return handleRequest(request, context);
}
