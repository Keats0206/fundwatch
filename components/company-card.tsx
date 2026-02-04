import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Company } from "@/lib/types";

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString();
}

const healthVariant = {
  green: "green" as const,
  yellow: "yellow" as const,
  red: "red" as const,
};

export function CompanyCard({ company }: { company: Company }) {
  const oneLiner =
    company.attentionReason ??
    (company.health === "green"
      ? "Stable or positive momentum."
      : company.health === "yellow"
        ? "Mixed or early warning signals."
        : "Repeated negative or high-severity signals.");

  return (
    <Link href={`/company/${company.id}`} className="block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg group">
      <Card className="h-full transition-colors hover:bg-muted/50 border-border/80 rounded-lg">
        <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-serif font-medium text-foreground truncate">{company.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{company.domain}</p>
          </div>
          <Badge variant={healthVariant[company.health]} className="shrink-0 capitalize rounded-md">
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
}
