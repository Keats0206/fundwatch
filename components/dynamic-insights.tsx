"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Users, Rocket, ExternalLink, Loader2 } from "lucide-react";
import { SourceBadge } from "@/components/source-badge";
import type { Signal, CompanyBrief } from "@/lib/types";

type Props = {
  signals: Signal[];
  brief: CompanyBrief | null | undefined;
  isCollectingSignals: boolean;
  isGeneratingBrief: boolean;
  streamingSignals?: Signal[]; // Signals coming in via SSE
};

function formatRelativeTime(iso: string): string {
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
  return date.toLocaleDateString();
}

export function DynamicInsights({ signals, brief, isCollectingSignals, isGeneratingBrief, streamingSignals = [] }: Props) {
  // Combine existing signals with streaming ones
  const allSignals = [...signals, ...streamingSignals];
  
  // Filter signals from the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSignals = allSignals
    .filter((s) => new Date(s.timestamp) >= thirtyDaysAgo)
    .slice(0, 5);

  const hasRecentActivity = recentSignals.length > 0;
  const hasBrief = brief && (brief.whyItMatters?.length > 0 || brief.whereYouCanHelp?.length > 0);

  return (
    <Card className="border-border/60">
      <CardContent className="p-6">
        {/* Recent Activity Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>
              <p className="text-base text-muted-foreground mt-1">
                Automated detections from news, career pages, LinkedIn, and blog posts
              </p>
            </div>
            {isCollectingSignals && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Collecting...</span>
              </motion.div>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {hasRecentActivity ? (
              <div className="space-y-4">
                {recentSignals.map((signal, idx) => (
                  <motion.div
                    key={signal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3 pb-4 border-b border-border/60 last:border-0 last:pb-0"
                  >
                    <div className="shrink-0 mt-0.5">
                      {signal.source === "News" && <Sparkles className="h-5 w-5 text-amber-500" />}
                      {signal.source === "Careers" && <TrendingUp className="h-5 w-5 text-blue-500" />}
                      {signal.source === "LinkedIn" && <Users className="h-5 w-5 text-sky-600" />}
                      {signal.source === "Blog" && <Rocket className="h-5 w-5 text-emerald-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-sm font-medium text-muted-foreground">
                          {signal.source}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatRelativeTime(signal.timestamp)}
                        </span>
                      </div>
                      <p className="text-base text-foreground leading-relaxed">{signal.summary}</p>
                      <a
                        href={signal.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent-highlight hover:underline mt-2"
                      >
                        View source
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-6 text-center"
              >
                <p className="text-base text-muted-foreground">
                  {signals.length === 0 
                    ? isCollectingSignals 
                      ? "Searching for activity..." 
                      : "No activity detected yet."
                    : "No activity in the last 30 days."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Why It Matters Section */}
        <div className="mb-8 border-t border-border/40 pt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold tracking-tight">Why It Matters</h2>
            {isGeneratingBrief && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating insights...</span>
              </motion.div>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {brief && brief.whyItMatters && brief.whyItMatters.length > 0 ? (
              <ul className="space-y-4">
                {brief.whyItMatters.slice(0, 3).map((item, idx) => {
                  const itemSignalIds = brief.signalIdsBySection?.whyItMatters?.[idx] || [];
                  const itemSignals = allSignals.filter((s) => itemSignalIds.includes(s.id));
                  
                  return (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.15 }}
                      className="flex items-start gap-3 pb-3 border-b border-border/40 last:border-0 last:pb-0"
                    >
                      <span className="text-accent-highlight mt-0.5 text-base">•</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-base text-foreground leading-relaxed mb-2">{item}</p>
                        {itemSignals.length > 0 && (
                          <SourceBadge signals={itemSignals} count={itemSignals.length} />
                        )}
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-4 text-center"
              >
                <p className="text-base text-muted-foreground">
                  {isGeneratingBrief ? "Analyzing activity..." : "Generate a brief to see insights."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recommended Next Steps Section */}
        <div className="border-t border-border/40 pt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold tracking-tight">Recommended Next Steps</h2>
            {isGeneratingBrief && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating recommendations...</span>
              </motion.div>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {brief?.plays && brief.plays.length > 0 ? (
              <div className="space-y-4">
                {brief.plays.map((play, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    className="pb-4 border-b border-border/40 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <span className="text-accent-highlight mt-0.5 text-base font-medium shrink-0">→</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-foreground mb-1.5">{play.title}</h3>
                        <p className="text-base text-muted-foreground mb-2">{play.why}</p>
                        <p className="text-sm text-muted-foreground italic">When: {play.when}</p>
                        {play.suggestedMessage && (
                          <div className="mt-3 p-3 bg-muted/50 rounded text-base text-foreground/80">
                            <p className="font-medium mb-1.5">Suggested message:</p>
                            <p className="whitespace-pre-wrap leading-relaxed">{play.suggestedMessage}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : brief && brief.whereYouCanHelp && brief.whereYouCanHelp.length > 0 ? (
              <div className="space-y-4">
                {brief.whereYouCanHelp.map((item, idx) => {
                  const itemSignalIds = brief.signalIdsBySection?.whereYouCanHelp?.[idx] || [];
                  const itemSignals = allSignals.filter((s) => itemSignalIds.includes(s.id));
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.15 }}
                      className="flex items-start gap-3 pb-3 border-b border-border/40 last:border-0 last:pb-0"
                    >
                      <span className="text-accent-highlight mt-0.5 text-base font-medium shrink-0">→</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-base text-foreground leading-relaxed mb-2">{item}</p>
                        {itemSignals.length > 0 && (
                          <SourceBadge signals={itemSignals} count={itemSignals.length} />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-4 text-center"
              >
                <p className="text-base text-muted-foreground">
                  {isGeneratingBrief ? "Analyzing recommendations..." : "Generate a brief to see recommendations."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
