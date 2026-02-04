import { NextRequest, NextResponse } from "next/server";
import { getCookieName } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const res = NextResponse.redirect(new URL("/login", origin));
  res.cookies.set(getCookieName(), "", {
    path: "/",
    maxAge: 0,
  });
  return res;
}
