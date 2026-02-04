import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookieName, validateFundId, isAuthEnabled } from "@/lib/auth";

const publicPaths = ["/login"];
const apiPaths = ["/api/login", "/api/logout", "/api/auth/me"];

function isPublic(pathname: string): boolean {
  return publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isApi(pathname: string): boolean {
  return apiPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow API routes
  if (isApi(pathname)) {
    return NextResponse.next();
  }
  
  // If auth is disabled, allow all access
  if (!isAuthEnabled()) {
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }
  
  // Allow public paths (login page)
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Check authentication
  const cookieName = getCookieName();
  const fundId = request.cookies.get(cookieName)?.value ?? null;
  const isValid = fundId ? validateFundId(fundId) : false;
  
  if (!fundId || !isValid) {
    // Redirect to login with return path
    const login = new URL("/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
