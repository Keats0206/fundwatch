"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/app-shell";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/demo") {
    return <>{children}</>;
  }
  return <AppShell>{children}</AppShell>;
}
