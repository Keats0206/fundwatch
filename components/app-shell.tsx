"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FundProvider, useFund } from "@/lib/fund-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Radio,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Portfolio", icon: LayoutDashboard },
  { href: "/signals", label: "Watch Patterns", icon: Radio },
  { href: "/settings", label: "Settings", icon: Settings },
];

function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-2 py-4">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            prefetch={false}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Sidebar() {
  const { lockedToFund } = useFund();
  return (
    <aside className="fixed left-0 top-0 w-56 h-screen border-r border-sidebar-border bg-sidebar flex flex-col z-10">
      <div className="bg-primary px-3 py-4 rounded-none">
        <div className="flex items-center gap-2">
          <img
            src="/logo_darkmode.png"
            alt="FundWatch"
            className="h-8 w-auto block dark:hidden"
          />
          <img
            src="/logo_lightmode.png"
            alt="FundWatch"
            className="h-8 w-auto hidden dark:block"
          />
          <div className="flex flex-col">
              <span className="text-lg text-white font-semibold tracking-tight">
                FundWatch
              </span>
              <span className="text-white/80 text-xs tracking-wider">
                Alerts → Actions
              </span>
           </div>
        </div>
      </div>
      <SidebarNav />
      {lockedToFund && (
        <div className="mt-auto px-2 py-4 border-t border-sidebar-border">
          <Link
            href="/api/logout"
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </Link>
        </div>
      )}
    </aside>
  );
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-56 overflow-auto bg-background bg-pattern-arcs relative">
        <span className="absolute top-6 right-8 w-4 h-4 text-accent-highlight font-serif text-2xl leading-none" aria-hidden>
          *
        </span>
        <div className="max-w-[95%] xl:max-w-[1400px] mx-auto py-10 px-6 lg:px-10 relative">
          {children}
        </div>
      </main>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <FundProvider>
      <AppShellInner>{children}</AppShellInner>
    </FundProvider>
  );
}
