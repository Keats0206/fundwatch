"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useFund } from "@/lib/fund-context";
import { useCompany, useSignals, useRoles, usePeopleChanges, useBrief, useAllBriefs, useSignalCache } from "@/lib/hooks/use-data";
import { BriefNavigation } from "@/components/brief-navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedInsights } from "@/components/unified-insights";
import { ManageSignals } from "@/components/manage-signals";
import { SignalsModal } from "@/components/signals-modal";
import { useSignalTexts } from "@/lib/hooks/use-data";
import { ExternalLink, Radio, Sparkles, CheckCircle2, AlertTriangle, TrendingUp, Users, DollarSign, Rocket, Handshake, PauseCircle, Settings, Link2, UserPlus, LucideIcon, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SourceBadge } from "@/components/source-badge";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { TypewriterText } from "@/components/ai-elements/typewriter-text";
import { PartnerTakeSkeleton, KeyFactorsSkeleton, MomentumSkeleton } from "@/components/ai-elements/section-skeletons";
import type { SignalText, PartnerTake, ConfidenceModifier, Play } from "@/lib/types";

type SignalMetadata = {
  tag: string;
  icon: LucideIcon;
  color: string;
};

const CATEGORIES = [
  { value: "Funding", label: "Funding", icon: DollarSign, color: "text-green-500" },
  { value: "Leadership", label: "Leadership", icon: UserPlus, color: "text-purple-500" },
  { value: "Hiring", label: "Hiring", icon: TrendingUp, color: "text-blue-500" },
  { value: "Product", label: "Product", icon: Rocket, color: "text-indigo-500" },
  { value: "Business", label: "Business", icon: Handshake, color: "text-teal-500" },
  { value: "Risk", label: "Risk", icon: AlertTriangle, color: "text-red-500" },
  { value: "General", label: "General", icon: DollarSign, color: "text-gray-500" },
];

const ICON_MAP: Record<string, LucideIcon> = {
  DollarSign,
  UserPlus,
  TrendingUp,
  Rocket,
  Handshake,
  Users,
  PauseCircle,
  AlertTriangle,
  Link2,
};

function getSignalMetadata(signal: SignalText): SignalMetadata {
  // Use stored category and icon if available
  if (signal.category && signal.iconName) {
    const category = CATEGORIES.find((c) => c.value === signal.category);
    const Icon = ICON_MAP[signal.iconName];
    if (category && Icon) {
      return { tag: category.label, icon: Icon, color: category.color };
    }
  }
  
  const text = signal.text.toLowerCase();
  
  if (signal.format === "url") {
    return { tag: "URL", icon: Link2, color: "text-blue-500" };
  }
  
  // Map signal text to metadata (fallback)
  if (text.includes("funding") || text.includes("raised") || text.includes("capital")) {
    return { tag: "Funding", icon: DollarSign, color: "text-green-500" };
  }
  if (text.includes("executive") || text.includes("hire")) {
    return { tag: "Leadership", icon: UserPlus, color: "text-purple-500" };
  }
  if (text.includes("hiring") && (text.includes("increase") || text.includes("activity"))) {
    return { tag: "Hiring", icon: TrendingUp, color: "text-blue-500" };
  }
  if (text.includes("hiring") && (text.includes("pause") || text.includes("slowdown"))) {
    return { tag: "Hiring", icon: PauseCircle, color: "text-orange-500" };
  }
  if (text.includes("product") || text.includes("launch") || text.includes("update")) {
    return { tag: "Product", icon: Rocket, color: "text-indigo-500" };
  }
  if (text.includes("partnership") || text.includes("customer")) {
    return { tag: "Business", icon: Handshake, color: "text-teal-500" };
  }
  if (text.includes("leadership") || text.includes("organizational")) {
    return { tag: "Leadership", icon: Users, color: "text-purple-500" };
  }
  if (text.includes("negative") || text.includes("controversy")) {
    return { tag: "Risk", icon: AlertTriangle, color: "text-red-500" };
  }
  
  // Default
  return { tag: "General", icon: DollarSign, color: "text-gray-500" };
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? "Just now" : `${diffMins} minutes ago`;
    }
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months !== 1 ? "s" : ""} ago`;
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const healthVariant = { green: "green", yellow: "yellow", red: "red" } as const;


export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0] ?? null;
  useFund();
  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null);
  const [isCollectingSignals, setIsCollectingSignals] = useState(false);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [briefError, setBriefError] = useState<string | null>(null);
  const waitingForBriefIdRef = useRef<string | null>(null);
  
  const { data: company, isLoading: companyLoading, error: companyError, refetch: refetchCompany } = useCompany(id);
  const { data: signalsData, refetch: refetchSignals } = useSignals(company?.id ?? null);
  const { data: rolesData, refetch: refetchRoles } = useRoles(company?.id ?? null);
  const { data: peopleData, refetch: refetchPeople } = usePeopleChanges(company?.id ?? null);
  const { data: allBriefs, refetch: refetchAllBriefs } = useAllBriefs(company?.id ?? null);
  const { data: brief, refetch: refetchBrief } = useBrief(company?.id ?? null, selectedBriefId ?? undefined);
  const { data: signalCache, refetch: refetchSignalCache } = useSignalCache(company?.id ?? null);
  const { data: signalTextsData, refetch: refetchSignalTexts } = useSignalTexts(company?.id ?? null);
  
  // Auto-select latest brief when briefs load
  useEffect(() => {
    if (allBriefs && allBriefs.length > 0 && !selectedBriefId) {
      setSelectedBriefId(allBriefs[0].id);
    }
  }, [allBriefs, selectedBriefId]);

  // When brief loads after we set selectedBriefId during generation, clear the generating state
  useEffect(() => {
    if (waitingForBriefIdRef.current && brief && brief.id === waitingForBriefIdRef.current && isGeneratingBrief) {
      console.log("[FundWatch] Brief loaded after generation, clearing isGeneratingBrief");
      setIsGeneratingBrief(false);
      waitingForBriefIdRef.current = null;
    }
  }, [brief, isGeneratingBrief]);

  // Auto-run alert when navigated with ?run=1 (from homepage watch input)
  useEffect(() => {
    if (searchParams.get("run") === "1" && company && !isCollectingSignals && !isGeneratingBrief) {
      setIsCollectingSignals(true);
      router.replace(`/company/${id}`, { scroll: false });
    }
  }, [searchParams, company, id, isCollectingSignals, isGeneratingBrief, router]);
  
  const signals = signalsData ?? [];
  const roles = rolesData ?? [];
  const people = peopleData ?? [];
  const signalTexts = signalTextsData ?? [];
  
  const [activeTab, setActiveTab] = useState<"overview" | "details">("overview");
  const [isSignalsModalOpen, setIsSignalsModalOpen] = useState(false);
  
  
  // Track which brief IDs have been animated (only animate on first render of newly generated briefs)
  const animatedBriefIdsRef = useRef<Set<string>>(new Set());
  const newlyGeneratedBriefIdRef = useRef<string | null>(null);
  
  // Sequential reveal state tracking
  const [revealedSections, setRevealedSections] = useState<{
    partnerTake: boolean;
    keyFactors: boolean;
    momentum: boolean;
  }>({
    partnerTake: false,
    keyFactors: false,
    momentum: false,
  });
  
  // Track when a new brief generation starts
  useEffect(() => {
    if (isGeneratingBrief && waitingForBriefIdRef.current) {
      newlyGeneratedBriefIdRef.current = waitingForBriefIdRef.current;
    }
  }, [isGeneratingBrief]);
  
  // Track when brief loads to start sequential reveals (only for newly generated briefs)
  useEffect(() => {
    if (brief && !isGeneratingBrief) {
      const isNewlyGenerated = newlyGeneratedBriefIdRef.current === brief.id && !animatedBriefIdsRef.current.has(brief.id);
      
      if (isNewlyGenerated) {
        // This is a newly generated brief - animate it
        animatedBriefIdsRef.current.add(brief.id);
        newlyGeneratedBriefIdRef.current = null;
        
        // Reset reveals for new brief
        setRevealedSections({
          partnerTake: false,
          keyFactors: false,
          momentum: false,
        });
        
        // Start revealing Partner Take immediately
        if (brief.partnerTake) {
          setRevealedSections(prev => ({ ...prev, partnerTake: true }));
        }
      } else {
        // Existing brief or already animated - show everything immediately without animation
        setRevealedSections({
          partnerTake: true,
          keyFactors: true,
          momentum: true,
        });
      }
    } else if (!brief && !isGeneratingBrief) {
      // Reset when brief is cleared
      setRevealedSections({
        partnerTake: false,
        keyFactors: false,
        momentum: false,
      });
    }
  }, [brief, isGeneratingBrief]);
  
  // Determine if we should animate (only for newly generated briefs on first render)
  // Should animate if this brief was just generated and we haven't animated it yet
  const shouldAnimate = brief && newlyGeneratedBriefIdRef.current === brief.id && !animatedBriefIdsRef.current.has(brief.id);
  
  // Handle Partner Take completion to trigger Key Factors/Momentum
  const handlePartnerTakeComplete = () => {
    setTimeout(() => {
      setRevealedSections(prev => ({
        ...prev,
        keyFactors: true,
        momentum: true,
      }));
    }, 400);
  };

  // Callbacks must be declared before early returns to maintain hook order
  const handleSignalsFound = useCallback(async (count: number) => {
    setBriefError(null);
    if (count > 0 && id) {
      console.log("[FundWatch] handleSignalsFound: starting brief generation, signals found:", count);
      setIsGeneratingBrief(true);

      try {
        // Call API - backend streams internally but we only wait for completion
        const response = await fetch(`/api/companies/${id}/generate-brief`, {
          method: "POST",
          headers: {
            "Accept": "text/event-stream",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        if (!reader) {
          throw new Error("No response body reader available");
        }

        // Only listen for brief_complete and error events
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() || "";

          for (const event of events) {
            if (!event.trim()) continue;
            
            let eventType = "";
            let eventData = "";
            
            for (const line of event.split("\n")) {
              if (line.startsWith("event: ")) {
                eventType = line.slice(7).trim();
              } else if (line.startsWith("data: ")) {
                eventData = line.slice(6);
              }
            }

            if (eventType === "brief_complete" && eventData) {
              try {
                const data = JSON.parse(eventData);
                console.log("[FundWatch] Brief complete, briefId:", data.briefId);
                waitingForBriefIdRef.current = data.briefId;
                setSelectedBriefId(data.briefId);
                
                // Wait for DB write to propagate, then refetch
                await new Promise(resolve => setTimeout(resolve, 500));
                refetchAllBriefs();
                refetchBrief();
                
                // Brief will load via useBrief hook, which will clear isGeneratingBrief
                break;
              } catch (parseErr) {
                console.error("[FundWatch] Failed to parse brief_complete:", parseErr);
              }
            } else if (eventType === "error" && eventData) {
              try {
                const data = JSON.parse(eventData);
                throw new Error(data.error || "Brief generation failed");
              } catch (parseErr) {
                // Ignore parse errors for error events
              }
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[FundWatch] handleSignalsFound: error:", msg);
        setIsGeneratingBrief(false);
        setBriefError(msg.includes("503") || msg.includes("unavailable") 
          ? "AI service temporarily unavailable — try again later." 
          : "Brief generation failed — try again.");
      }
    }
  }, [id, refetchAllBriefs, refetchBrief]);

  const handleSignalCollectionComplete = useCallback(async () => {
    console.log("[FundWatch] handleSignalCollectionComplete: collection finished, refetching signals");
    setIsCollectingSignals(false);
    // Refetch signals immediately so parent has new data before we hide streamingSignals
    await refetchSignals();
  }, [refetchSignals]);

  if (!id) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Company not found.</p>
        <Button variant="link" onClick={() => router.push("/")} className="mt-2">
          Back to Portfolio
        </Button>
      </div>
    );
  }
  
  if (companyLoading) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }
  
  if (companyError || !company) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Company not found.</p>
        <Button variant="link" onClick={() => router.push("/")} className="mt-2">
          Back to Portfolio
        </Button>
      </div>
    );
  }

  // Filter signals from the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSignals = signals
    .filter((s) => new Date(s.timestamp) >= thirtyDaysAgo)
    .slice(0, 10); // Last 10 signals from last 30 days
  const hasRecentActivity = recentSignals.length > 0;
  const lastActivityDate = hasRecentActivity 
    ? recentSignals[0].timestamp 
    : signalCache?.lastChecked || company.lastUpdated;

  return (
    <div className="min-h-screen bg-background bg-pattern-arcs">
      <div className="max-w-[95%] xl:max-w-[1400px] mx-auto py-6 px-6 lg:px-10">
        <div className="space-y-8">
          {/* Header */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground">
                  {company.name}
                </h1>
                <Badge variant={healthVariant[company.health]} className="capitalize rounded-md">
                  {company.health}
                </Badge>
              </div>
              <a
                href={`https://${company.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-muted-foreground hover:text-accent-highlight inline-flex items-center gap-1 mt-2 transition-colors"
              >
                {company.domain}
                <ExternalLink className="h-3 w-3" />
              </a>
              {/* Tracking summary */}
              {signalTexts.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-sm text-muted-foreground">
                    {signalTexts.length} {signalTexts.length === 1 ? "signal" : "signals"} tracked*
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSignalsModalOpen(true)}
                    className="h-6 px-2 text-muted-foreground hover:text-foreground"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-md relative overflow-hidden"
                  onClick={() => setIsCollectingSignals(true)}
                  disabled={isCollectingSignals}
                >
                  {isCollectingSignals && (
                    <motion.div
                      className="absolute inset-0 bg-accent-highlight/10"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  <div className="inline-flex items-center">
                    {!isCollectingSignals && <Radio className="h-4 w-4 mr-2" />}
                    {isCollectingSignals ? (
                      <Shimmer as="span" duration={2}>Checking...</Shimmer>
                    ) : (
                      "Run alert"
                    )}
                  </div>
                </Button>
              </motion.div>
            </div>
          </header>

          {/* Main Content - Actionable Summaries */}
          <div className="space-y-6">
            {/* Brief Navigation - Show history if multiple briefs exist */}
            {allBriefs && allBriefs.length > 1 && brief && (
              <BriefNavigation
                briefs={allBriefs}
                currentBriefId={selectedBriefId}
                onSelectBrief={setSelectedBriefId}
              />
            )}

            {/* 0. PARTNER TAKE - Decisive, opinionated */}
            <AnimatePresence mode="wait">
              {(isCollectingSignals || (isGeneratingBrief && !brief?.partnerTake)) ? (
                <PartnerTakeSkeleton key="partner-take-skeleton" />
              ) : brief?.partnerTake && revealedSections.partnerTake && !isCollectingSignals ? (
                <motion.section
                  key="partner-take"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold tracking-tight">Partner Take</h2>
                    {brief.partnerTake && (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            brief.partnerTake.action === "re-engage"
                              ? "default"
                              : brief.partnerTake.action === "monitor"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {brief.partnerTake.action === "re-engage" && "Re-engage"}
                          {brief.partnerTake.action === "monitor" && "Monitor"}
                          {brief.partnerTake.action === "ignore" && "Ignore"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {(brief.partnerTake.confidence * 100)}% confidence
                        </span>
                      </div>
                    )}
                  </div>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-foreground leading-relaxed mb-3">
                        <TypewriterText
                          text={brief.partnerTake.take}
                          speed={6}
                          delay={0}
                          skipAnimation={!shouldAnimate}
                          onComplete={shouldAnimate ? handlePartnerTakeComplete : undefined}
                        />
                      </p>
                      {(brief.partnerTake.rationaleBullets?.length ?? 0) > 0 && (
                        <ul className="space-y-1.5 pt-3 border-t border-border/40">
                          {(brief.partnerTake.rationaleBullets ?? []).map((bullet, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-accent-highlight mt-0.5">•</span>
                              <span>
                                <TypewriterText
                                  text={bullet}
                                  speed={5}
                                  delay={idx * 20}
                                  skipThreshold={100}
                                  skipAnimation={!shouldAnimate}
                                />
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </motion.section>
              ) : null}
            </AnimatePresence>

            {/* What Would Change My Mind + Momentum - below Partner Take */}
            <AnimatePresence mode="wait">
              {(isCollectingSignals || (isGeneratingBrief && !brief?.confidenceModifiers && brief?.momentumScore === undefined)) ? (
                <div className="grid grid-cols-1 lg:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
                  <KeyFactorsSkeleton />
                  <MomentumSkeleton />
                </div>
              ) : (brief?.confidenceModifiers || brief?.momentumScore !== undefined) && revealedSections.keyFactors && !isCollectingSignals ? (
                <motion.div
                  key="key-factors-momentum"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 lg:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6"
                >
                  {brief?.confidenceModifiers && (
                    <section>
                      <h2 className="text-xl font-semibold tracking-tight mb-4">Key Factors</h2>
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="text-green-500 mt-0.5 text-sm">↑</span>
                              <p className="text-sm text-foreground leading-relaxed">
                                <TypewriterText
                                  text={brief.confidenceModifiers.increases}
                                  speed={6}
                                  delay={0}
                                  skipThreshold={200}
                                  skipAnimation={!shouldAnimate}
                                />
                              </p>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-red-500 mt-0.5 text-sm">↓</span>
                              <p className="text-sm text-foreground leading-relaxed">
                                <TypewriterText
                                  text={brief.confidenceModifiers.decreases}
                                  speed={6}
                                  delay={80}
                                  skipThreshold={200}
                                  skipAnimation={!shouldAnimate}
                                />
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </section>
                  )}
                  {brief?.momentumScore !== undefined && (
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-semibold tracking-tight">Momentum</h2>
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-muted/60 text-muted-foreground border border-border/40 cursor-help"
                            title="Experimental feature — not yet accurate."
                          >
                            Alpha — not yet accurate
                            <HelpCircle className="h-3.5 w-3.5" />
                          </span>
                        </div>
                        <Badge variant={brief.momentumStatus === "green" ? "default" : brief.momentumStatus === "yellow" ? "secondary" : "destructive"} className="capitalize">
                          {brief.momentumStatus}
                        </Badge>
                      </div>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-2xl font-semibold text-foreground">{brief.momentumScore.toFixed(1)}</p>
                              <p className="text-sm text-muted-foreground">Momentum Score</p>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">
                                <TypewriterText
                                  text={
                                    brief.momentumScore >= 4
                                      ? "Strong positive momentum - consider re-engaging"
                                      : brief.momentumScore >= 1.5
                                      ? "Moderate momentum - monitor closely"
                                      : "Low momentum - may need attention"
                                  }
                                  speed={6}
                                  delay={150}
                                  skipThreshold={100}
                                  skipAnimation={!shouldAnimate}
                                />
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </section>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {briefError && (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                {briefError}
              </div>
            )}

            {/* Unified Insights - Combines signal collection and insights display */}
            {company && (
              <UnifiedInsights
                companyId={company.id}
                companyName={company.name}
                signals={signals}
                brief={brief}
                isCollectingSignals={isCollectingSignals}
                isGeneratingBrief={isGeneratingBrief}
                onSignalCollectionComplete={handleSignalCollectionComplete}
                onSignalsFound={handleSignalsFound}
                newlyGeneratedBriefId={waitingForBriefIdRef.current}
              />
            )}
          </div>

          {/* Signals Modal */}
          {company && id && (
            <SignalsModal
              companyId={id}
              signals={signalTexts}
              open={isSignalsModalOpen}
              onClose={() => setIsSignalsModalOpen(false)}
              onUpdate={refetchSignalTexts}
            />
          )}
        </div>
      </div>
    </div>
  );
}
