import { NextRequest, NextResponse } from "next/server";

const CIRCLE_API_ORIGIN = "https://api.circle.com";

function getKitKey(): string | undefined {
  return process.env.KIT_KEY ?? process.env.NEXT_PUBLIC_KIT_KEY;
}

async function proxyToCircle(
  request: NextRequest,
  pathSegments: string[],
): Promise<NextResponse> {
  const targetUrl = new URL(pathSegments.join("/"), `${CIRCLE_API_ORIGIN}/`);
  targetUrl.search = request.nextUrl.search;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  const userAgent = request.headers.get("x-user-agent");
  if (userAgent) {
    headers.set("x-user-agent", userAgent);
  }

  const kitKey = getKitKey();
  const incomingAuth = request.headers.get("authorization");
  if (kitKey) {
    headers.set("authorization", `Bearer ${kitKey}`);
  } else if (incomingAuth) {
    headers.set("authorization", incomingAuth);
  }

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();

  let circleResponse: Response;
  try {
    circleResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to reach Circle API. Check your network connection.",
      },
      { status: 502 },
    );
  }

  const responseBody = await circleResponse.text();
  const responseHeaders = new Headers();
  const responseContentType = circleResponse.headers.get("content-type");
  if (responseContentType) {
    responseHeaders.set("content-type", responseContentType);
  }

  return new NextResponse(responseBody, {
    status: circleResponse.status,
    headers: responseHeaders,
  });
}

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyToCircle(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyToCircle(request, path);
}
