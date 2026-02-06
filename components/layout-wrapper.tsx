"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { FundProvider } from "@/lib/fund-context";
import { isDemoCompany } from "@/lib/demo-utils";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Exclude login and demo pages from AppShell (they have their own layouts)
  if (pathname === "/login" || pathname.startsWith("/demo")) {
    return <>{children}</>;
  }
  
  // For company routes, check if it's a demo company
  if (pathname.startsWith("/company/")) {
    const companyMatch = pathname.match(/^\/company\/([^/]+)/);
    const companyId = companyMatch ? companyMatch[1] : null;
    
    // If this is a demo company, don't show AppShell (no sidebar)
    // But still wrap in FundProvider so useFund() works
    if (isDemoCompany(companyId)) {
      return <FundProvider>{children}</FundProvider>;
    }
  }
  
  return <AppShell>{children}</AppShell>;
}
