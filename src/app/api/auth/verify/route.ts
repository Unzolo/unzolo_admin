import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.unzolo.com/api";

export async function POST(request: NextRequest) {
  try {
    const { phone_number, otp } = await request.json();

    if (!phone_number || !otp) {
      return NextResponse.json(
        { success: false, message: "Phone number and OTP are required." },
        { status: 400 }
      );
    }

    // Call admin-specific verify endpoint — already checks role=admin server-side
    const verifyRes = await fetch(`${API}/admin/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number, otp }),
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.success || !verifyData.token) {
      return NextResponse.json(
        { success: false, message: verifyData.message || "Invalid OTP." },
        { status: verifyRes.status }
      );
    }

    // Set cookies — httpOnly for middleware, readable for axios Bearer header
    const response = NextResponse.json({
      success: true,
      user: verifyData.user,
    });

    const cookieOpts = {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    };

    response.cookies.set("admin_token", verifyData.token, { ...cookieOpts, httpOnly: true });
    response.cookies.set("admin_token_client", verifyData.token, { ...cookieOpts, httpOnly: false });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
