import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookieName, validateFundId, isAuthEnabled } from "@/lib/auth";

const publicPaths = ["/login", "/demo"];
const apiPaths = ["/api/login", "/api/logout"];

function isPublic(pathname: string): boolean {
  return publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isApi(pathname: string): boolean {
  return apiPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isApi(pathname)) {
    return NextResponse.next();
  }
  if (!isAuthEnabled()) {
    if (pathname === "/login") {
      console.log("[FundWatch auth] Auth disabled, redirecting /login → /");
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const cookieName = getCookieName();
  const fundId = request.cookies.get(cookieName)?.value ?? null;
  const isValid = fundId ? validateFundId(fundId) : false;
  
  if (!fundId || !isValid) {
    // Redirect unauthenticated users to login
    console.log("[FundWatch auth] No valid fund cookie, redirecting to /login", { 
      pathname, 
      cookieName,
      hasCookie: !!fundId, 
      cookieValue: fundId,
      validFund: isValid,
      allCookies: Array.from(request.cookies.getAll().map(c => c.name))
    });
    const login = new URL("/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
