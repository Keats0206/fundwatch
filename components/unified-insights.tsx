"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Users, Rocket, ExternalLink, CheckCircle2, ChevronDown, ChevronUp, Copy, DollarSign, Handshake, Zap, LucideIcon, Globe } from "lucide-react";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { TypewriterText } from "@/components/ai-elements/typewriter-text";
import { ActionsSkeleton, WhyItMattersSkeleton, SourcesSkeleton } from "@/components/ai-elements/section-skeletons";
import { SourceBadge } from "@/components/source-badge";
import type { Signal, CompanyBrief } from "@/lib/types";

type EventData =
  | { type: "start"; companyId: string; companyName: string }
  | { type: "cached"; lastChecked: string; signalsGenerated: number; urlsChecked: number }
  | { type: "discovery"; message: string; urls?: Array<{ url: string; label: string }> }
  | { type: "checking"; url: string; status: "fetching" | "changed" | "unchanged" | "initial_check" | "error"; error?: string }
  | { type: "analyzing"; url: string; message: string }
  | { type: "signal_created"; signal: { id: string; summary: string; source: string; url: string } }
  | { type: "news_search"; message: string }
  | { type: "complete"; signalsAdded: number; urlsChecked?: number }
  | { type: "error"; error: string };

type LogEntry = {
  id: string;
  type: EventData["type"];
  message: string;
  timestamp: Date;
  data?: unknown;
};

type Props = {
  companyId: string;
  companyName: string;
  signals: Signal[];
  brief: CompanyBrief | null | undefined;
  isCollectingSignals: boolean;
  isGeneratingBrief: boolean;
  onSignalCollectionComplete: () => void;
  onSignalsFound?: (count: number) => void;
  newlyGeneratedBriefId?: string | null; // ID of newly generated brief to animate
};

function getPlayIcon(title: string, when: string): { Icon: LucideIcon; color: string } {
  const text = `${title} ${when}`.toLowerCase();
  if (text.includes("talent") || text.includes("hiring") || text.includes("scaling") || text.includes("positions")) return { Icon: Users, color: "text-blue-500" };
  if (text.includes("fund") || text.includes("raise") || text.includes("capital") || text.includes("series")) return { Icon: DollarSign, color: "text-green-600" };
  if (text.includes("partner") || text.includes("collaborat") || text.includes("outreach") || text.includes("intro")) return { Icon: Handshake, color: "text-amber-600" };
  return { Icon: Zap, color: "text-accent-highlight" };
}

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

export function UnifiedInsights({
  companyId,
  companyName,
  signals,
  brief,
  isCollectingSignals,
  isGeneratingBrief,
  onSignalCollectionComplete,
  onSignalsFound,
  newlyGeneratedBriefId,
}: Props) {
  // Signal collection state
  const [streamingSignals, setStreamingSignals] = useState<Signal[]>([]);
  const [isCollectionComplete, setIsCollectionComplete] = useState(false);
  const [signalsAdded, setSignalsAdded] = useState(0);
  const [currentStatus, setCurrentStatus] = useState<string>("Checking for recent activity…");
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [checkedUrls, setCheckedUrls] = useState<Array<{ url: string; status: string }>>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const logIdRef = useRef(0);
  
  // Track which brief IDs have been animated (only animate newly generated briefs)
  const animatedBriefIdsRef = useRef<Set<string>>(new Set());
  
  // Sequential reveal state tracking
  const [revealedSections, setRevealedSections] = useState<{
    actions: boolean;
    whyItMatters: boolean;
    sources: boolean;
  }>({
    actions: false,
    whyItMatters: false,
    sources: false,
  });
  
  // Track when brief loads to start sequential reveals (only for newly generated briefs)
  useEffect(() => {
    if (brief && !isCollectingSignals && !isGeneratingBrief) {
      const isNewlyGenerated = newlyGeneratedBriefId === brief.id && !animatedBriefIdsRef.current.has(brief.id);
      
      if (isNewlyGenerated) {
        // This is a newly generated brief - animate it
        animatedBriefIdsRef.current.add(brief.id);
        
        // Reset reveals for new brief
        setRevealedSections({
          actions: false,
          whyItMatters: false,
          sources: false,
        });
        
        // Start revealing Actions after a delay (simulating Key Factors completion)
        const actionsTimeout = setTimeout(() => {
          setRevealedSections(prev => ({ ...prev, actions: true }));
        }, 600);
        
        return () => clearTimeout(actionsTimeout);
      } else {
        // Existing brief or already animated - show everything immediately without animation
        setRevealedSections({
          actions: true,
          whyItMatters: true,
          sources: true,
        });
      }
    } else if (!brief && !isGeneratingBrief) {
      // Reset when brief is cleared
      setRevealedSections({
        actions: false,
        whyItMatters: false,
        sources: false,
      });
    }
  }, [brief, isCollectingSignals, isGeneratingBrief, newlyGeneratedBriefId]);
  
  // Determine if we should animate (only for newly generated briefs on first render)
  // Should animate if this brief was just generated and we haven't animated it yet
  const shouldAnimate = brief && newlyGeneratedBriefId === brief.id && !animatedBriefIdsRef.current.has(brief.id);
  
  // Handle Actions completion to trigger Why It Matters
  const handleActionsComplete = () => {
    setTimeout(() => {
      setRevealedSections(prev => ({ ...prev, whyItMatters: true }));
    }, 800);
  };
  
  // Handle Why It Matters completion to trigger Sources
  const handleWhyItMattersComplete = () => {
    setTimeout(() => {
      setRevealedSections(prev => ({ ...prev, sources: true }));
    }, 400);
  };

  const addLog = (type: EventData["type"], message: string, data?: unknown) => {
    setLogs((prev) => [...prev, { id: `log-${logIdRef.current++}`, type, message, timestamp: new Date(), data }]);
  };

  // Handle signal collection SSE
  useEffect(() => {
    if (!isCollectingSignals) {
      // Don't clear streamingSignals here - keep them visible until parent refetches and has new data.
      // Clearing caused blank state because parent's signals hadn't updated yet.
      setIsCollectionComplete(false);
      setSignalsAdded(0);
      setCurrentStatus("Checking for recent activity…");
      setCurrentUrl(null);
      setCheckedUrls([]);
      setLogs([]);
      // Close any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    // Close any existing connection before starting a new one
    if (eventSourceRef.current) {
      console.log("[FundWatch UnifiedInsights] Closing existing SSE connection before starting new one");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Clear streaming when starting a NEW collection
    setStreamingSignals([]);
    setIsCollectionComplete(false);
    setCurrentStatus("Checking for recent activity…");
    setSignalsAdded(0);

    const url = `/api/companies/${companyId}/check-signals?force=true`;
    console.log("[FundWatch UnifiedInsights] Starting SSE:", url);
    const es = new EventSource(url);
    eventSourceRef.current = es;

    // Handle connection errors immediately
    es.onopen = () => {
      console.log("[FundWatch UnifiedInsights] SSE connection opened");
    };

    es.addEventListener("start", () => {
      setCurrentStatus("Checking for recent activity…");
    });

    es.addEventListener("cached", (e: MessageEvent) => {
      const data = JSON.parse(e.data) as Extract<EventData, { type: "cached" }>;
      console.log("[FundWatch UnifiedInsights] SSE cached:", data.signalsGenerated, "signals");
      setIsCollectionComplete(true);
      setSignalsAdded(data.signalsGenerated);
      if (data.signalsGenerated === 0) {
        setCurrentStatus("No material changes detected in the last 30 days");
      } else {
        setCurrentStatus(`New activity detected`);
        // Trigger brief generation even for cached signals if they exist
        console.log("[FundWatch UnifiedInsights] Calling onSignalsFound for cached signals:", data.signalsGenerated);
        onSignalsFound?.(data.signalsGenerated);
      }
      setTimeout(() => onSignalCollectionComplete(), 1000);
    });

    es.addEventListener("discovery", () => {
      setCurrentStatus("Checking hiring, product updates, and news…");
    });

    es.addEventListener("checking", (e: MessageEvent) => {
      const data = JSON.parse(e.data) as Extract<EventData, { type: "checking" }>;
      try {
        const urlObj = new URL(data.url);
        const urlPath = urlObj.pathname || urlObj.hostname;
        setCurrentUrl(urlPath);
        addLog("checking", `Checking ${urlPath}...`, data);
        
        setCheckedUrls((prev) => {
          const existing = prev.findIndex((u) => u.url === data.url);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = { url: data.url, status: data.status };
            return updated;
          }
          return [...prev, { url: data.url, status: data.status }];
        });
        
        if (data.status === "unchanged") {
          setCurrentStatus(`Checked ${urlPath} — no changes`);
        } else if (data.status === "changed") {
          setCurrentStatus(`New activity detected on ${urlPath}`);
        } else if (data.status === "fetching") {
          setCurrentStatus(`Checking ${urlPath}...`);
        }
      } catch {
        setCurrentUrl(data.url);
        addLog("checking", `Checking ${data.url}...`, data);
      }
    });

    es.addEventListener("signal_created", (e: MessageEvent) => {
      const data = JSON.parse(e.data) as Extract<EventData, { type: "signal_created" }>;
      const signalData = data.signal;
      const fullSignal: Signal = {
        id: signalData.id,
        companyId: companyId,
        source: signalData.source as Signal["source"],
        timestamp: new Date().toISOString(),
        summary: signalData.summary,
        externalUrl: signalData.url,
      };
      setStreamingSignals((prev) => [...prev, fullSignal]);
      setSignalsAdded((prev) => prev + 1);
      setCurrentStatus("New activity detected");
      addLog("signal_created", signalData.summary);
    });

    es.addEventListener("news_search", () => {
      setCurrentStatus("Searching recent news…");
      addLog("news_search", "Searching for recent news articles");
    });

    es.addEventListener("complete", (e: MessageEvent) => {
      const data = JSON.parse(e.data) as Extract<EventData, { type: "complete" }>;
      console.log("[FundWatch UnifiedInsights] SSE complete: signalsAdded=", data.signalsAdded, "urlsChecked=", data.urlsChecked);
      
      // Only process if this connection is still active
      if (eventSourceRef.current !== es) {
        console.log("[FundWatch UnifiedInsights] Ignoring complete event from stale connection");
        return;
      }
      
      setSignalsAdded(data.signalsAdded);
      setIsCollectionComplete(true);
      setCurrentUrl(null);
      
      if (data.signalsAdded === 0) {
        setCurrentStatus(`Checked ${data.urlsChecked || checkedUrls.length} sources — no material changes detected`);
      } else {
        setCurrentStatus(`Found ${data.signalsAdded} new ${data.signalsAdded === 1 ? "signal" : "signals"}`);
      }
      
      es.close();
      eventSourceRef.current = null;
      
      if (data.signalsAdded > 0) {
        console.log("[FundWatch UnifiedInsights] Calling onSignalsFound:", data.signalsAdded);
        // Call onSignalsFound immediately to trigger brief generation
        onSignalsFound?.(data.signalsAdded);
      }
      
      // Call onSignalCollectionComplete after a short delay to allow brief generation to start
      setTimeout(() => {
        onSignalCollectionComplete();
      }, 500);
    });

    es.addEventListener("error", (e: MessageEvent) => {
      const data = JSON.parse(e.data) as Extract<EventData, { type: "error" }>;
      console.error("[FundWatch UnifiedInsights] SSE event error:", data.error);
      addLog("error", `Error: ${data.error}`);
      setIsCollectionComplete(true);
      setCurrentStatus("AI service temporarily unavailable — try again later.");
      es.close();
    });

    es.onerror = (ev) => {
      console.error("[FundWatch UnifiedInsights] SSE connection error:", ev);
      // Only handle error if this is still the active connection
      if (eventSourceRef.current === es) {
        addLog("error", "Connection error");
        setIsCollectionComplete(true);
        setCurrentStatus("AI service temporarily unavailable — try again later.");
        es.close();
        eventSourceRef.current = null;
      }
    };

    return () => {
      console.log("[FundWatch UnifiedInsights] Cleaning up SSE connection");
      if (eventSourceRef.current === es) {
        es.close();
        eventSourceRef.current = null;
      }
    };
  }, [isCollectingSignals, companyId, companyName, onSignalCollectionComplete, onSignalsFound]);

  // Combine existing signals with streaming ones. Dedupe by externalUrl so we don't show
  // duplicates when parent refetches and streamingSignals overlap with signals.
  const seenUrls = new Set(signals.map((s) => s.externalUrl));
  const newStreaming = streamingSignals.filter((s) => !seenUrls.has(s.externalUrl));
  const allSignals = [...signals, ...newStreaming];

  // Build source URLs: from signals first; fallback to brief.insights evidence when signals are empty
  const sourceUrlsRaw: Array<{ url: string; label?: string }> = [];
  if (allSignals.length > 0) {
    allSignals.forEach((s) => {
      if (s.externalUrl) sourceUrlsRaw.push({ url: s.externalUrl, label: s.source });
    });
  } else if (brief?.insights?.length) {
    brief.insights.forEach((insight) => {
      insight.evidence?.forEach((e) => {
        if (e.url) sourceUrlsRaw.push({ url: e.url, label: e.source });
      });
    });
  }
  const sourceUrls = Array.from(new Map(sourceUrlsRaw.map((s) => [s.url, s])).values());
  const hasRealSources = sourceUrls.length > 0;
  
  // Filter signals from the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSignals = allSignals
    .filter((s) => new Date(s.timestamp) >= thirtyDaysAgo)
    .slice(0, 5);

  const hasRecentActivity = recentSignals.length > 0;
  const showCollectionStatus = isCollectingSignals && !isCollectionComplete;
  
  // Show sections when not collecting signals (skeletons shown during brief generation)
  const showSections = !isCollectingSignals;

  return (
    <Card className="border-border/60">
      <CardContent className="p-6">
        {/* Collection Status Banner - shown when actively collecting */}
        {showCollectionStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 pb-6 border-b border-border/40"
          >
            <div className="flex items-start gap-3">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <Sparkles className="h-4 w-4 text-accent-highlight mt-0.5" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  <Shimmer as="span" duration={2}>{currentStatus}</Shimmer>
                </p>
                {currentUrl && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Currently checking: {currentUrl}
                  </p>
                )}
                {!currentUrl && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Monitoring {companyName}'s site, hiring pages, and public news
                  </p>
                )}
              </div>
            </div>

            {/* Show checked URLs summary */}
            {checkedUrls.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/40">
                <p className="text-xs text-muted-foreground mb-1.5">
                  Checked {checkedUrls.length} {checkedUrls.length === 1 ? "source" : "sources"}:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {checkedUrls.map((item, idx) => {
                    try {
                      const urlObj = new URL(item.url);
                      const displayName = urlObj.pathname || urlObj.hostname.replace("www.", "");
                      return (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                            item.status === "changed"
                              ? "bg-accent-highlight/20 text-accent-highlight"
                              : item.status === "unchanged"
                              ? "bg-muted/50 text-muted-foreground"
                              : "bg-muted/30 text-muted-foreground"
                          }`}
                        >
                          {item.status === "changed" && "●"}
                          {displayName}
                        </span>
                      );
                    } catch {
                      return (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-muted/30 text-muted-foreground"
                        >
                          {item.url}
                        </span>
                      );
                    }
                  })}
                </div>
              </div>
            )}

            {/* Technical trace - collapsed by default */}
            {logs.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/60">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showDetails ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Hide collection log
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      View collection log
                    </>
                  )}
                </Button>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 space-y-1 max-h-64 overflow-y-auto text-xs text-muted-foreground bg-muted/50 rounded p-2"
                  >
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2 py-0.5">
                        <span className="text-[10px] shrink-0 w-12">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        <span className="flex-1">{log.message}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Actions - Visual anchor, first after Partner Take */}
        {showSections && (
          <AnimatePresence mode="wait">
            {isGeneratingBrief && !brief?.plays && !brief?.whereYouCanHelp ? (
              <ActionsSkeleton key="actions-skeleton" />
            ) : (brief?.plays && brief.plays.length > 0) || (brief?.whereYouCanHelp && brief.whereYouCanHelp.length > 0) ? (
              revealedSections.actions ? (
                <motion.div
                  key="actions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-8 pt-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold tracking-tight">What You Can Do</h2>
                  </div>

                  <AnimatePresence mode="popLayout">
                    {brief?.plays && brief.plays.length > 0 ? (
                      <div className="space-y-3">
                        {brief.plays.map((play, idx, arr) => {
                          const { Icon, color } = getPlayIcon(play.title, play.when);
                          const isLastPlay = idx === arr.length - 1;
                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/30 hover:shadow-sm hover:border-border transition-all relative overflow-hidden group"
                            >
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-highlight/40 group-hover:bg-accent-highlight/60 transition-colors" />
                              <div className="flex items-start gap-3 flex-1 min-w-0 pl-1">
                                <div className={`shrink-0 mt-0.5 rounded-md p-1.5 bg-background/80 ${color}`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-semibold text-foreground mb-1">
                                    <TypewriterText
                                      text={play.title}
                                      speed={15}
                                      delay={idx * 30}
                                      skipThreshold={50}
                                      skipAnimation={!shouldAnimate}
                                    />
                                  </h3>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    <TypewriterText
                                      text={play.why}
                                      speed={6}
                                      delay={idx * 15 + 30}
                                      skipThreshold={150}
                                      skipAnimation={!shouldAnimate}
                                      onComplete={isLastPlay && shouldAnimate ? handleActionsComplete : undefined}
                                    />
                                  </p>
                                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-muted-foreground bg-muted/60 border border-border/40">
                                    When: {play.when}
                                  </span>
                                  {play.suggestedMessage && (
                                    <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border/30 text-sm text-foreground/80">
                                      <p className="font-medium mb-1.5 text-xs text-muted-foreground">Suggested message</p>
                                      <p className="whitespace-pre-wrap leading-relaxed">
                                        <TypewriterText
                                          text={play.suggestedMessage}
                                          speed={15}
                                          delay={idx * 30 + 100}
                                          skipThreshold={300}
                                          skipAnimation={!shouldAnimate}
                                        />
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {play.suggestedMessage && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shrink-0"
                                  onClick={() => {
                                    navigator.clipboard.writeText(play.suggestedMessage ?? "");
                                  }}
                                >
                                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                                  Copy
                                </Button>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : brief?.whereYouCanHelp && brief.whereYouCanHelp.length > 0 ? (
                      <div className="space-y-3">
                        {brief.whereYouCanHelp.map((item, idx, arr) => {
                          const isLastItem = idx === arr.length - 1;
                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="flex items-start gap-3 p-4 rounded-lg border border-border/60 bg-muted/20"
                            >
                              <span className="text-accent-highlight mt-0.5 text-sm font-medium shrink-0">→</span>
                              <p className="text-sm text-foreground leading-relaxed">
                                <TypewriterText
                                  text={item}
                                  speed={40}
                                  delay={idx * 50}
                                  skipThreshold={200}
                                  onComplete={isLastItem ? handleActionsComplete : undefined}
                                />
                              </p>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              ) : null
            ) : !isGeneratingBrief ? (
              <motion.div
                key="actions-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8 pt-6 py-4 text-center"
              >
                <p className="text-sm text-muted-foreground">
                  Run alert to see recommended actions.
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        )}

        {/* Why It Matters Section - After actions */}
        {showSections && (
          <AnimatePresence mode="wait">
            {isGeneratingBrief && !brief?.whyItMatters ? (
              <WhyItMattersSkeleton key="why-it-matters-skeleton" />
            ) : brief?.whyItMatters && brief.whyItMatters.length > 0 ? (
              revealedSections.whyItMatters ? (
                <motion.div
                  key="why-it-matters"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-8 pt-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold tracking-tight">Why It Matters</h2>
                  </div>

                  <ul className="space-y-4">
                    {brief.whyItMatters.slice(0, 5).map((item, idx) => {
                      const itemSignalIds = brief.signalIdsBySection?.whyItMatters?.[idx] || [];
                      const itemSignals = allSignals.filter((s) => itemSignalIds.includes(s.id));
                      const isLastItem = idx === Math.min(brief.whyItMatters.length - 1, 4);
                      
                      return (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3 pb-3 border-b border-border/40 last:border-0 last:pb-0"
                        >
                          <span className="text-accent-highlight mt-0.5 text-sm">•</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground leading-relaxed mb-2">
                              <TypewriterText
                                text={item}
                                speed={6}
                                delay={idx * 30}
                                skipThreshold={200}
                                skipAnimation={!shouldAnimate}
                                onComplete={isLastItem && shouldAnimate ? handleWhyItMattersComplete : undefined}
                              />
                            </p>
                            {itemSignals.length > 0 && (
                              <SourceBadge signals={itemSignals} count={itemSignals.length} />
                            )}
                          </div>
                        </motion.li>
                      );
                    })}
                  </ul>
                </motion.div>
              ) : null
            ) : !isGeneratingBrief ? (
              <motion.div
                key="why-it-matters-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8 pt-6 py-4 text-center"
              >
                <p className="text-sm text-muted-foreground">
                  Run alert to see why it matters.
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        )}

        {/* Sources - actual URLs that informed the brief (signals or brief evidence); Google only when no sources */}
        {showSections && (
          <AnimatePresence mode="wait">
            {isGeneratingBrief && !hasRealSources ? (
              <SourcesSkeleton key="sources-skeleton" />
            ) : hasRealSources ? (
              revealedSections.sources ? (
                <motion.div
                  key="sources"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-8 pt-8 border-t border-border/40"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Sources</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const maxVisible = 6;
                      const visible = showSources ? sourceUrls : sourceUrls.slice(0, maxVisible);
                      const remaining = sourceUrls.length - maxVisible;
                      return (
                        <>
                          {visible.map(({ url, label }, idx) => {
                            let domain = "";
                            try {
                              domain = new URL(url).hostname.replace("www.", "");
                            } catch {
                              domain = url;
                            }
                            const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
                            return (
                              <motion.a
                                key={url}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-muted/50 border border-border/40 shadow-sm hover:bg-muted/70 hover:shadow transition-colors text-xs text-foreground"
                              >
                                <img
                                  src={faviconUrl}
                                  alt=""
                                  className="h-4 w-4 shrink-0 rounded"
                                />
                                <span className="truncate max-w-[160px]" title={label}>{domain}</span>
                              </motion.a>
                            );
                          })}
                          {!showSources && remaining > 0 && (
                            <motion.button
                              type="button"
                              onClick={() => setShowSources(true)}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: Math.min(6, visible.length) * 0.05 }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-muted/50 border border-border/40 shadow-sm hover:bg-muted/70 hover:shadow transition-colors text-xs text-muted-foreground hover:text-foreground"
                            >
                              +{remaining} more
                            </motion.button>
                          )}
                          {showSources && sourceUrls.length > maxVisible && (
                            <button
                              type="button"
                              onClick={() => setShowSources(false)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-muted/50 border border-border/40 shadow-sm hover:bg-muted/70 transition-colors text-xs text-muted-foreground hover:text-foreground"
                            >
                              <ChevronUp className="h-3.5 w-3.5 mr-0.5" />
                              Show less
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </motion.div>
              ) : null
            ) : !isGeneratingBrief ? (
              <motion.div
                key="sources-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 pt-8 border-t border-border/40"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Sources</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <p className="text-xs text-muted-foreground italic">
                    Run alert to discover sources from careers, blog, LinkedIn, and news.
                  </p>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(companyName + " company")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors text-xs text-muted-foreground hover:text-foreground"
                  >
                    <img
                      src={`https://www.google.com/s2/favicons?domain=google.com&sz=32`}
                      alt=""
                      className="h-4 w-4 shrink-0 rounded"
                    />
                    <span>Search for more</span>
                  </a>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}
