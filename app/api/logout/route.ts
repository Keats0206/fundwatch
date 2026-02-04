import { NextRequest, NextResponse } from "next/server";
import { getCookieName } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const cookieName = getCookieName();
  const isProduction = process.env.NODE_ENV === "production";
  const isSecure = request.nextUrl.protocol === "https:" || isProduction;
  
  const res = NextResponse.redirect(new URL("/login", origin));
  res.cookies.set(cookieName, "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: isSecure,
    httpOnly: false,
  });
  return res;
}
