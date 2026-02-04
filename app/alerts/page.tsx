"use client";

import Link from "next/link";
import { useFund } from "@/lib/fund-context";
import { useAlerts, useCompanies } from "@/lib/hooks/use-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AlertType } from "@/lib/types";

const alertTypeLabels: Record<AlertType, string> = {
  hiring_pause: "Hiring pause",
  exec_departure: "Exec departure",
  no_activity: "No public activity",
  negative_press: "Negative press",
  role_churn: "Repeated role churn",
};

export default function AlertsPage() {
  const { fundId } = useFund();
  const { data: alertsData, isLoading: alertsLoading, error: alertsError } = useAlerts(fundId);
  const { data: companiesData } = useCompanies(fundId);
  const alerts = alertsData ?? [];
  const companies = companiesData ?? [];
  const companyMap = new Map(companies.map((c) => [c.id, c]));

  if (alertsError) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">Failed to load alerts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] mb-1">
          Alerts
        </p>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground">
          Alerts
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl">
          Quiet or concerning changes across your portfolio. Worth a look before your next call.
        </p>
      </header>

      {alertsLoading ? (
        <p className="text-muted-foreground">Loading alerts…</p>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No alerts for this fund right now.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => {
            const company = companyMap.get(alert.companyId);
            return (
              <li key={alert.id}>
                <Card className="rounded-lg border-border/80">
                  <CardContent className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/company/${alert.companyId}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {company?.name ?? "Unknown company"}
                        </Link>
                        <Badge variant="secondary" className="capitalize">
                          {alertTypeLabels[alert.type]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.whyItMatters}
                      </p>
                    </div>
                    <Link
                      href={`/company/${alert.companyId}`}
                      className="text-sm font-medium text-accent-highlight hover:underline shrink-0"
                    >
                      View company →
                    </Link>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
