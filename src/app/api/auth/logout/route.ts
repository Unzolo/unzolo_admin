import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  const clear = { httpOnly: false, secure: false, sameSite: "lax" as const, path: "/", maxAge: 0 };
  response.cookies.set("admin_token", "", { ...clear, httpOnly: true });
  response.cookies.set("admin_token_client", "", clear);
  return response;
}
