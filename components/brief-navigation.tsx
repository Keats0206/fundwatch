"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { CompanyBrief } from "@/lib/types";

type Props = {
  briefs: CompanyBrief[];
  currentBriefId: string | null;
  onSelectBrief: (briefId: string) => void;
};

function formatBriefDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function BriefNavigation({ briefs, currentBriefId, onSelectBrief }: Props) {
  if (briefs.length <= 1) return null;

  const currentIndex = briefs.findIndex((b) => b.id === currentBriefId);
  const currentBrief = currentIndex >= 0 ? briefs[currentIndex] : briefs[0];
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < briefs.length - 1;

  const handlePrevious = () => {
    if (canGoBack && currentIndex > 0) {
      onSelectBrief(briefs[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (canGoForward && currentIndex < briefs.length - 1) {
      onSelectBrief(briefs[currentIndex + 1].id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/60"
    >
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={!canGoBack}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm text-muted-foreground min-w-[120px] text-center">
          Brief {currentIndex + 1} of {briefs.length}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!canGoForward}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      {currentBrief && (
        <div className="text-sm text-muted-foreground">
          Generated {formatBriefDate(currentBrief.createdAt)}
        </div>
      )}
    </motion.div>
  );
}
