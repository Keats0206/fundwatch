import type { Signal } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SignalTimeline({ signals }: { signals: Signal[] }) {
  if (signals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">No signals for this company yet.</p>
    );
  }

  return (
    <ul className="space-y-0">
      {signals.map((signal, i) => (
        <li key={signal.id} data-signal-id={signal.id} className="relative flex gap-4 pb-6 last:pb-0">
          {i < signals.length - 1 && (
            <span
              className="absolute left-[7px] top-5 bottom-0 w-px bg-border"
              aria-hidden
            />
          )}
          <span
            className={cn(
              "shrink-0 mt-0.5 h-2 w-2 rounded-full border-2 border-background",
              signal.source === "Careers" && "bg-blue-500",
              signal.source === "LinkedIn" && "bg-sky-600",
              signal.source === "News" && "bg-amber-500",
              signal.source === "Blog" && "bg-emerald-500"
            )}
          />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">{signal.source}</span>
              <span>{formatTimestamp(signal.timestamp)}</span>
            </div>
            <p className="text-sm text-foreground">{signal.summary}</p>
            <a
              href={signal.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View source
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
