"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useFund } from "@/lib/fund-context";
import { useOpenRolesForFund, useCompanies } from "@/lib/hooks/use-data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { RoleType } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const roleTypeLabels: Record<RoleType, string> = {
  Engineering: "Engineering",
  GTM: "GTM",
  Leadership: "Leadership",
  Other: "Other",
};

const ROLE_TYPES: RoleType[] = ["Engineering", "GTM", "Leadership", "Other"];

function isNewThisWeek(firstSeen: string) {
  const d = new Date(firstSeen);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return d >= weekAgo;
}

export default function HiringRadarPage() {
  const { fundId } = useFund();
  const [roleTypeFilter, setRoleTypeFilter] = useState<RoleType | "all">("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [newThisWeekOnly, setNewThisWeekOnly] = useState(false);
  const { data: openRolesData, isLoading: rolesLoading, error: rolesError } = useOpenRolesForFund(fundId);
  const { data: companiesData } = useCompanies(fundId);
  const openRoles = openRolesData ?? [];
  const companies = companiesData ?? [];

  const filteredRoles = useMemo(() => {
    let list: typeof openRoles = openRoles;
    if (roleTypeFilter !== "all") {
      list = list.filter((r) => r.roleType === roleTypeFilter);
    }
    if (companyFilter !== "all") {
      list = list.filter((r) => r.companyId === companyFilter);
    }
    if (newThisWeekOnly) {
      list = list.filter((r) => isNewThisWeek(r.firstSeen));
    }
    return list;
  }, [openRoles, roleTypeFilter, companyFilter, newThisWeekOnly]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em] mb-1">
          Hiring
        </p>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground">
          Hiring Radar
        </h1>
        <p className="text-base text-muted-foreground mt-2 max-w-xl">
          Open roles across your portfolio. Help source candidates where it matters.
        </p>
      </header>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Filters</h2>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6">
          <div className="space-y-2">
            <Label className="text-base">Role type</Label>
            <select
              value={roleTypeFilter}
              onChange={(e) =>
                setRoleTypeFilter(e.target.value === "all" ? "all" : (e.target.value as RoleType))
              }
              className={cn(
                "flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[140px]"
              )}
            >
              <option value="all">All</option>
              {ROLE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {roleTypeLabels[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-base">Company</Label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className={cn(
                "flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[160px]"
              )}
            >
              <option value="all">All companies</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2 pt-8">
            <Checkbox
              id="new-this-week"
              checked={newThisWeekOnly}
              onCheckedChange={(v) => setNewThisWeekOnly(v === true)}
            />
            <Label htmlFor="new-this-week" className="text-sm font-normal cursor-pointer">
              New this week
            </Label>
          </div>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-xl font-semibold mb-4">Open roles</h2>
        {rolesLoading ? (
          <p className="text-base text-muted-foreground">Loading…</p>
        ) : filteredRoles.length === 0 ? (
          <p className="text-base text-muted-foreground py-4">
            No open roles match your filters.
          </p>
        ) : (
          <ul className="space-y-3">
            {filteredRoles.map((r) => (
              <li key={r.id}>
                <Card className="rounded-lg border-border/80">
                  <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/company/${r.companyId}`}
                          prefetch={false}
                          className="font-medium text-foreground hover:text-accent-highlight hover:underline transition-colors"
                        >
                          {r.company.name}
                        </Link>
                        {r.highPriority && (
                          <Badge variant="destructive" className="text-xs">
                            High priority
                          </Badge>
                        )}
                        {isNewThisWeek(r.firstSeen) && (
                          <Badge variant="secondary">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {r.title} · {r.source} · First seen {formatDate(r.firstSeen)}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 w-fit text-sm">
                      {r.roleType}
                    </Badge>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
