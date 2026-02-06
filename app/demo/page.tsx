"use client";

import { useState, useMemo } from "react";
import { useCompanies, useAttentionCompanies, useWeeklyMotion, useFundById } from "@/lib/hooks/use-data";
import { CompanyCard } from "@/components/company-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Plus, Building2, TrendingUp, Users, AlertTriangle, Rocket, UserCheck, ArrowRight } from "lucide-react";
import type { Company } from "@/lib/types";

type SortOption = "name" | "updated" | "health";

const healthOrder: Record<Company["health"], number> = { red: 0, yellow: 1, green: 2 };

function sortCompanies(companies: Company[], sortBy: SortOption): Company[] {
  const copy = [...companies];
  switch (sortBy) {
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "updated":
      return copy.sort(
        (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );
    case "health":
      return copy.sort((a, b) => healthOrder[a.health] - healthOrder[b.health]);
    default:
      return copy;
  }
}

export default function DemoPage() {
  const [sortBy, setSortBy] = useState<SortOption>("health");
  
  // Use demo fund from database
  const fundId = "demo";
  const { data: fund, isLoading: fundLoading } = useFundById(fundId);
  const { data: companiesData, isLoading: companiesLoading } = useCompanies(fundId);
  const { data: attentionCompaniesData, isLoading: attentionLoading } = useAttentionCompanies(fundId);
  const { data: weeklyMotionData, isLoading: motionLoading } = useWeeklyMotion(fundId);
  
  const companies = companiesData ?? [];
  const attentionCompanies = attentionCompaniesData ?? [];
  const weeklyMotion = weeklyMotionData;
  const isLoading = fundLoading || companiesLoading || attentionLoading || motionLoading;
  
  // Calculate motion stats from weeklyMotion data
  const motionStats = weeklyMotion ? {
    totalCompanies: weeklyMotion.totalCompanies,
    capitalEvents: weeklyMotion.capitalEvents,
    hiringInflections: weeklyMotion.hiringInflections,
    silentRiskSignals: weeklyMotion.silentRiskSignals,
    productUpdates: weeklyMotion.productUpdates,
    leadershipChanges: weeklyMotion.leadershipChanges,
  } : {
    totalCompanies: 0,
    capitalEvents: 0,
    hiringInflections: 0,
    silentRiskSignals: 0,
    productUpdates: 0,
    leadershipChanges: 0,
  };
  
  const sortedCompanies = useMemo(() => sortCompanies(companies, sortBy), [companies, sortBy]);

  return (
    <div className="min-h-screen bg-background bg-pattern-arcs">
      {/* Demo Banner */}
      <div className="bg-accent/20 border-b border-border/60 py-3 px-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Demo Mode</span>
            <span className="text-sm text-foreground">This is a sample portfolio showing FundWatch capabilities</span>
          </div>
          <Link href="/login">
            <Button size="sm" variant="outline" className="rounded-md">
              Sign in to your account
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-[95%] xl:max-w-[1400px] mx-auto py-6 px-6 lg:px-10">
        <div className="space-y-6">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] mb-1">
                Portfolio
              </p>
              <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground">
                {fund?.name ?? "Sample Fund"}
              </h1>
            </div>
          </header>

          {motionStats.totalCompanies > 0 && (
            <Card className="border-0 bg-accent/20">
              <CardHeader>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] mb-1">
                  This week&apos;s motion
                </p>
                <h2 className="font-serif text-xl font-medium text-foreground">
                  {motionStats.totalCompanies} {motionStats.totalCompanies === 1 ? "company" : "companies"} moved meaningfully
                </h2>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-3 border-t border-border/60 pt-3">
                  {motionStats.capitalEvents > 0 && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-foreground">
                        <strong>{motionStats.capitalEvents}</strong> capital {motionStats.capitalEvents === 1 ? "event" : "events"}
                      </span>
                    </div>
                  )}
                  {motionStats.hiringInflections > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-foreground">
                        <strong>{motionStats.hiringInflections}</strong> hiring {motionStats.hiringInflections === 1 ? "inflection" : "inflections"}
                      </span>
                    </div>
                  )}
                  {motionStats.silentRiskSignals > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-foreground">
                        <strong>{motionStats.silentRiskSignals}</strong> silent-risk {motionStats.silentRiskSignals === 1 ? "signal" : "signals"}
                      </span>
                    </div>
                  )}
                  {motionStats.productUpdates > 0 && (
                    <div className="flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-foreground">
                        <strong>{motionStats.productUpdates}</strong> product {motionStats.productUpdates === 1 ? "update" : "updates"}
                      </span>
                    </div>
                  )}
                  {motionStats.leadershipChanges > 0 && (
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm text-foreground">
                        <strong>{motionStats.leadershipChanges}</strong> leadership {motionStats.leadershipChanges === 1 ? "change" : "changes"}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {attentionCompanies.length > 0 && (
            <Card className="border-0 bg-surface-taupe/30">
              <CardHeader>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] mb-1">
                  This week&apos;s attention
                </p>
                <h2 className="font-serif text-xl font-medium text-foreground">
                  Companies that may need action or a check-in.
                </h2>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 border-t border-border/60 pt-3">
                  {attentionCompanies.map((company) => (
                    <li key={company.id}>
                      <Link
                        href={`/company/${company.id}`}
                        prefetch={false}
                        className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md py-1 group"
                      >
                        <span className="font-medium text-foreground">{company.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {company.attentionReason ?? "Needs attention."}
                        </span>
                        <span className="text-accent-highlight text-sm group-hover:underline sm:ml-auto">View →</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] mb-2">
                  Your watches
                </p>
                <h2 className="font-serif text-xl font-medium text-foreground">Portfolio</h2>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="sort-companies" className="text-sm text-muted-foreground whitespace-nowrap">
                  Sort by
                </Label>
                <select
                  id="sort-companies"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[160px]"
                >
                  <option value="health">Health (needs attention first)</option>
                  <option value="updated">Last updated</option>
                  <option value="name">Name A–Z</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedCompanies.length === 0 ? (
                <Card className="col-span-full border-border/80 rounded-lg">
                  <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <Building2 className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="font-serif text-lg font-medium text-foreground mb-1">No companies yet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                      Add your first portfolio company to start tracking signals, alerts, and tasks.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                sortedCompanies.map((company) => {
                  const oneLiner =
                    company.attentionReason ??
                    (company.health === "green"
                      ? "Stable or positive momentum."
                      : company.health === "yellow"
                        ? "Mixed or early warning signals."
                        : "Repeated negative or high-severity signals.");

                  function formatDate(iso: string) {
                    const d = new Date(iso);
                    const now = new Date();
                    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
                    if (diff === 0) return "Today";
                    if (diff === 1) return "Yesterday";
                    if (diff < 7) return `${diff} days ago`;
                    return d.toLocaleDateString();
                  }

                  return (
                    <Link key={company.id} href={`/demo/company/${company.id}`} prefetch={false} className="block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg group">
                      <Card className="h-full transition-colors hover:bg-muted/50 border-border/80 rounded-lg">
                        <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-serif font-medium text-foreground truncate">{company.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{company.domain}</p>
                          </div>
                          <Badge variant={company.health === "green" ? "green" : company.health === "yellow" ? "yellow" : "red"} className="shrink-0 capitalize rounded-md">
                            {company.health}
                          </Badge>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-2">
                          <p className="text-sm text-muted-foreground line-clamp-2">{oneLiner}</p>
                          <p className="text-xs text-muted-foreground">Updated {formatDate(company.lastUpdated)}</p>
                          {company.highlightChips.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {company.highlightChips.map((chip) => (
                                <span
                                  key={chip}
                                  className={cn(
                                    "inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-medium bg-muted/80"
                                  )}
                                >
                                  {chip}
                                </span>
                              ))}
                            </div>
                          )}
                          <span className="text-xs font-medium text-accent-highlight group-hover:underline inline-block mt-1">
                            View →
                          </span>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
