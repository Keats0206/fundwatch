"use client";

import { cn } from "@/lib/utils";
import { ExternalLink, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

interface BriefItemProps {
  children: React.ReactNode;
  variant?: "default" | "action" | "question";
  signalIds?: string[];
  onSignalClick?: (signalId: string) => void;
}

export function BriefItem({
  children,
  variant = "default",
  signalIds = [],
  onSignalClick,
}: BriefItemProps) {
  const [checked, setChecked] = useState(false);
  const isActionable = variant === "action" || variant === "question";

  return (
    <div
      className={cn(
        "flex items-start gap-3 py-2.5 px-3 rounded-md transition-colors",
        isActionable && "hover:bg-muted/50 cursor-pointer group",
        checked && "opacity-60"
      )}
      onClick={isActionable ? () => setChecked(!checked) : undefined}
    >
      {isActionable ? (
        <button
          type="button"
          className="mt-0.5 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setChecked(!checked);
          }}
        >
          {checked ? (
            <CheckCircle2 className="h-4 w-4 text-accent-highlight" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground group-hover:text-accent-highlight transition-colors" />
          )}
        </button>
      ) : (
        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground/40 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm leading-relaxed text-foreground", checked && "line-through text-muted-foreground")}>
          {children}
        </p>
        {signalIds.length > 0 && (
          <div className="flex items-center gap-2 mt-1.5">
            {signalIds.map((signalId) => (
              <button
                key={signalId}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSignalClick?.(signalId);
                }}
                className="text-[10px] font-medium text-accent-highlight hover:underline uppercase tracking-wider inline-flex items-center gap-1"
              >
                Source
                <ExternalLink className="h-2.5 w-2.5" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
