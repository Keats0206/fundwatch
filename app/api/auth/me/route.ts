import { NextRequest, NextResponse } from "next/server";
import { getCookieName, validateFundId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const cookieName = getCookieName();
  const fundId = request.cookies.get(cookieName)?.value ?? null;
  const isValid = fundId ? validateFundId(fundId) : false;
  
  if (!fundId || !isValid) {
    return NextResponse.json({ fundId: null }, { status: 401 });
  }
  
  return NextResponse.json({ fundId });
}
