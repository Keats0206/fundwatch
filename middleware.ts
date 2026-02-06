import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookieName, validateFundId, isAuthEnabled } from "@/lib/auth";

const publicPaths = ["/login", "/demo"];
const apiPaths = ["/api/login", "/api/logout", "/api/auth/me"];

function isPublic(pathname: string): boolean {
  return publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isCompanyRoute(pathname: string): boolean {
  return pathname.startsWith("/company/");
}

function isDemoApiRoute(pathname: string): boolean {
  // Allow API routes for demo companies (check-signals, generate-brief, etc.)
  return pathname.startsWith("/api/companies/") && pathname.includes("/check-signals") || pathname.includes("/generate-brief");
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
  
  // Allow public paths (login page, demo)
  if (isPublic(pathname)) {
    return NextResponse.next();
  }
  
  // Allow company routes - they'll check auth internally if needed
  // Demo companies will be accessible, real companies require auth
  // The company page component handles this gracefully
  if (isCompanyRoute(pathname)) {
    return NextResponse.next();
  }

  // Check authentication for all other routes
  const cookieName = getCookieName();
  const cookie = request.cookies.get(cookieName);
  const fundId = cookie?.value ?? null;
  const isValid = fundId ? validateFundId(fundId) : false;
  
  if (!fundId || !isValid) {
    // If user hits root without auth, redirect to demo (easy sharing)
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/demo", request.url));
    }
    
    // Debug logging in production to diagnose issues
    if (process.env.NODE_ENV === "production") {
      console.log("[FundWatch auth] Auth check failed", {
        pathname,
        cookieName,
        hasCookie: !!cookie,
        cookieValue: fundId ? `${fundId.substring(0, 10)}...` : null,
        isValid,
        cookieCount: request.cookies.getAll().length,
      });
    }
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
