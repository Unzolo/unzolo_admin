import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "https://api.unzolo.com/api";

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const backendUrl = `${BACKEND}/${path.join("/")}`;

  // Append original query string
  const search = request.nextUrl.search;
  const targetUrl = backendUrl + search;

  // Read the httpOnly token server-side — never exposed to the browser
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    console.log("[Proxy] No token found in cookies");
    return NextResponse.json(
      { success: false, message: "No admin token provided. Please log in." },
      { status: 401 }
    );
  }

  console.log(`[Proxy] Using token: ${token.substring(0, 10)}... for backend: ${BACKEND}`);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    "X-Forwarded-For": request.headers.get("x-forwarded-for") || "",
  };

  // Forward body for non-GET requests
  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      body = await request.text();
    } catch {
      body = undefined;
    }
  }

  console.log(`[Proxy] Forwarding ${request.method} ${targetUrl}`);

  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    });

    console.log(`[Proxy] Backend returned ${res.status}`);

    const contentType = res.headers.get("content-type") || "";
    let data: unknown;
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[Proxy Error]", err);
    return NextResponse.json(
      { success: false, message: "Proxy request failed" },
      { status: 502 }
    );
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
