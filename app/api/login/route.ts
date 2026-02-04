import { NextRequest, NextResponse } from "next/server";
import { validateCredentials, getCookieName } from "@/lib/auth";
import { getFund } from "@/lib/data";

export async function POST(request: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid body" },
      { status: 400 }
    );
  }

  const { username, password } = body;
  if (!username || !password) {
    console.warn("[FundWatch login] Missing username or password");
    return NextResponse.json(
      { error: "Username and password required" },
      { status: 400 }
    );
  }

  const fundId = validateCredentials(username, password);
  if (!fundId) {
    console.warn("[FundWatch login] Invalid credentials for username:", username);
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  }

  let fundName = fundId;
  try {
    const fund = await getFund(fundId);
    fundName = fund?.name ?? fundId;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[FundWatch login] Could not fetch fund name (using fundId as name):", msg);
  }

  const cookieName = getCookieName();
  // Always use secure in production (Vercel is always HTTPS)
  const isSecure = process.env.NODE_ENV === "production" || request.nextUrl.protocol === "https:";
  
  // Create response with cookie
  const res = NextResponse.json({
    fundId,
    fundName,
  });
  
  // Set cookie with proper settings for persistence
  res.cookies.set(cookieName, fundId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: "lax",
    secure: isSecure, // Always true in production
    httpOnly: true, // Secure - prevents XSS
  });
  
  return res;
}
