import { NextRequest, NextResponse } from "next/server";
import { getCookieName } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const cookieName = getCookieName();
  const isSecure = request.nextUrl.protocol === "https:";
  
  const res = NextResponse.redirect(new URL("/login", origin));
  res.cookies.set(cookieName, "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: isSecure,
    httpOnly: true,
  });
  return res;
}
