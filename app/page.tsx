"use client";

import { useState, useMemo } from "react";
import { useFund } from "@/lib/fund-context";
import { useCompanies, useAttentionCompanies, useWeeklyMotion } from "@/lib/hooks/use-data";
import { CompanyCard } from "@/components/company-card";
import { AddCompanyModal } from "@/components/add-company-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Plus, Building2, TrendingUp, Users, AlertTriangle, Rocket, UserCheck } from "lucide-react";
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

export default function PortfolioDashboard() {
  const { fundId, fund, fundsLoading } = useFund();
  const [sortBy, setSortBy] = useState<SortOption>("health");
  const { data: companiesData, isLoading: companiesLoading, error: companiesError, refetch: refetchCompanies } = useCompanies(fundId);
  const { data: attentionCompaniesData, isLoading: attentionLoading, refetch: refetchAttention } = useAttentionCompanies(fundId);
  const { data: weeklyMotion, isLoading: motionLoading } = useWeeklyMotion(fundId);
  const companies = companiesData ?? [];
  const attentionCompanies = attentionCompaniesData ?? [];
  const sortedCompanies = useMemo(() => sortCompanies(companies, sortBy), [companies, sortBy]);
  const isLoading = fundsLoading || companiesLoading || attentionLoading || motionLoading;
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);

  const handleAddCompanySuccess = () => {
    refetchCompanies();
    refetchAttention();
  };

  if (companiesError) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Setup in progress — check back soon.</p>
        <p className="text-xs text-muted-foreground mt-2">If this persists, verify Supabase and env configuration.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] mb-1">
            Portfolio
          </p>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground">
            {isLoading ? "Loading…" : fund?.name ?? (fundId ? fundId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Select a fund")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setAddCompanyOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add company
          </Button>
        </div>
      </header>

      {addCompanyOpen && fundId && (
        <AddCompanyModal
          fundId={fundId}
          fundName={fund?.name ?? fundId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          onClose={() => setAddCompanyOpen(false)}
          onSuccess={handleAddCompanySuccess}
        />
      )}

      {!isLoading && weeklyMotion && weeklyMotion.totalCompanies > 0 && (
        <Card className="border-0 bg-accent/20">
          <CardHeader>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] mb-1">
              This week&apos;s motion
            </p>
            <h2 className="font-serif text-xl font-medium text-foreground">
              {weeklyMotion.totalCompanies} {weeklyMotion.totalCompanies === 1 ? "company" : "companies"} moved meaningfully
            </h2>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-4 border-t border-border/60 pt-4">
              {weeklyMotion.capitalEvents > 0 && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-foreground">
                    <strong>{weeklyMotion.capitalEvents}</strong> capital {weeklyMotion.capitalEvents === 1 ? "event" : "events"}
                  </span>
                </div>
              )}
              {weeklyMotion.hiringInflections > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-foreground">
                    <strong>{weeklyMotion.hiringInflections}</strong> hiring {weeklyMotion.hiringInflections === 1 ? "inflection" : "inflections"}
                  </span>
                </div>
              )}
              {weeklyMotion.silentRiskSignals > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-foreground">
                    <strong>{weeklyMotion.silentRiskSignals}</strong> silent-risk {weeklyMotion.silentRiskSignals === 1 ? "signal" : "signals"}
                  </span>
                </div>
              )}
              {weeklyMotion.productUpdates > 0 && (
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-foreground">
                    <strong>{weeklyMotion.productUpdates}</strong> product {weeklyMotion.productUpdates === 1 ? "update" : "updates"}
                  </span>
                </div>
              )}
              {weeklyMotion.leadershipChanges > 0 && (
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm text-foreground">
                    <strong>{weeklyMotion.leadershipChanges}</strong> leadership {weeklyMotion.leadershipChanges === 1 ? "change" : "changes"}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && attentionCompanies.length > 0 && (
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
            <ul className="space-y-4 border-t border-border/60 pt-4">
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
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
          {isLoading ? (
            <p className="text-muted-foreground col-span-full">Loading companies…</p>
          ) : sortedCompanies.length === 0 ? (
            <Card className="col-span-full border-border/80 rounded-lg">
              <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-lg font-medium text-foreground mb-1">No companies yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                  Add your first portfolio company to start tracking signals, alerts, and tasks.
                </p>
                <Button
                  size="sm"
                  className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setAddCompanyOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add company
                </Button>
              </CardContent>
            </Card>
          ) : (
            sortedCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
