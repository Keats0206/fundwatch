"use client";

import { useState, useRef } from "react";
import { ExternalLink, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Signal } from "@/lib/types";

type Props = {
  signals: Signal[];
  count: number;
};

export function SourceBadge({ signals, count }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
      closeTimeoutRef.current = null;
    }, 200);
  };

  if (signals.length === 0) return null;

  // Group signals by domain for display
  const domainMap = new Map<string, Signal[]>();
  signals.forEach((signal) => {
    try {
      const url = new URL(signal.externalUrl);
      const domain = url.hostname.replace("www.", "");
      if (!domainMap.has(domain)) {
        domainMap.set(domain, []);
      }
      domainMap.get(domain)!.push(signal);
    } catch {
      // Invalid URL, skip
    }
  });

  const domains = Array.from(domainMap.entries());
  const currentSignal = signals[currentSourceIndex];
  const totalSources = signals.length;

  // Extract domain from URL
  const getDomain = (url: string): string => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => {
          clearCloseTimeout();
          setIsHovered(true);
          setShowTooltip(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          scheduleClose();
        }}
        onClick={() => setShowTooltip(!showTooltip)}
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors group"
      >
        <span className="flex -space-x-1.5">
          {domains.slice(0, Math.min(3, domains.length)).map(([domain], idx) => (
            <span
              key={domain}
              className="inline-block h-5 w-5 rounded-full bg-gradient-to-br from-muted to-muted/60 border border-border/50 text-[9px] font-medium flex items-center justify-center text-foreground/70"
              style={{ zIndex: 10 - idx }}
            >
              {domain.split(".")[0][0].toUpperCase()}
            </span>
          ))}
        </span>
        <span className="flex items-center gap-1">
          {count} source{count !== 1 ? "s" : ""}
          <ChevronRight className="h-3 w-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </span>
      </button>

      <AnimatePresence>
        {(showTooltip || isHovered) && currentSignal && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-full left-0 mb-1 w-96 bg-popover border border-border/60 rounded-lg shadow-xl p-4 z-50"
            onMouseEnter={() => {
              clearCloseTimeout();
              setShowTooltip(true);
            }}
            onMouseLeave={() => {
              setIsHovered(false);
              scheduleClose();
            }}
          >
            {/* Header with navigation */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {currentSourceIndex + 1} / {totalSources}
                </span>
                <span className="text-xs text-muted-foreground">
                  {totalSources} source{totalSources !== 1 ? "s" : ""}
                </span>
              </div>
              {totalSources > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSourceIndex((prev) => (prev > 0 ? prev - 1 : totalSources - 1));
                    }}
                    className="p-1 rounded hover:bg-muted/50 transition-colors"
                    disabled={totalSources === 1}
                  >
                    <ChevronRight className="h-3 w-3 rotate-180 text-muted-foreground" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSourceIndex((prev) => (prev < totalSources - 1 ? prev + 1 : 0));
                    }}
                    className="p-1 rounded hover:bg-muted/50 transition-colors"
                    disabled={totalSources === 1}
                  >
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>

            {/* Current source */}
            <a
              href={currentSignal.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-muted/50 text-[10px] font-medium text-foreground/80">
                    {getDomain(currentSignal.externalUrl)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 group-hover:text-foreground transition-colors">
                  {currentSignal.summary}
                </p>
                <div className="flex items-center gap-1.5 pt-1 text-[10px] text-muted-foreground group-hover:text-accent-highlight transition-colors">
                  <span>View source</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            </a>

            {/* All sources list (collapsed) */}
            {totalSources > 1 && (
              <div className="mt-3 pt-3 border-t border-border/40">
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {signals.map((signal, idx) => {
                    const domain = getDomain(signal.externalUrl);
                    return (
                      <button
                        key={signal.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentSourceIndex(idx);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded text-[10px] transition-colors ${
                          idx === currentSourceIndex
                            ? "bg-accent-highlight/10 text-foreground"
                            : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{domain}</span>
                          {idx === currentSourceIndex && (
                            <span className="text-[8px] text-accent-highlight">●</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
