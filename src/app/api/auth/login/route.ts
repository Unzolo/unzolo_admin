import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL || "https://staging.unzolo.com/api";

export async function POST(request: NextRequest) {
  try {
    const { phone_number } = await request.json();

    if (!phone_number || !/^\d{10}$/.test(phone_number)) {
      return NextResponse.json(
        { success: false, message: "A valid 10-digit phone number is required." },
        { status: 400 }
      );
    }

    const res = await fetch(`${API}/admin/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
