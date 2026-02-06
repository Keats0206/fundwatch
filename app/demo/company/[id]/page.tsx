"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useCompany, useSignals, useBrief, useSignalTexts, useAllBriefs } from "@/lib/hooks/use-data";
import { BriefNavigation } from "@/components/brief-navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UnifiedInsights } from "@/components/unified-insights";
import { SignalsModal } from "@/components/signals-modal";
import { ExternalLink, ArrowLeft, Settings, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TypewriterText } from "@/components/ai-elements/typewriter-text";
import { PartnerTakeSkeleton, KeyFactorsSkeleton, MomentumSkeleton } from "@/components/ai-elements/section-skeletons";

const healthVariant = { green: "green", yellow: "yellow", red: "red" } as const;

export default function DemoCompanyPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0] ?? null;
  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null);
  const [isSignalsModalOpen, setIsSignalsModalOpen] = useState(false);

  // Use real hooks with dynamic loading - data layer handles demo fund automatically
  const { data: company, isLoading: companyLoading, error: companyError } = useCompany(id);
  const { data: signalsData, isLoading: signalsLoading } = useSignals(id);
  const { data: allBriefs, isLoading: briefsLoading } = useAllBriefs(id);
  const { data: brief, isLoading: briefLoading } = useBrief(id, selectedBriefId ?? undefined);
  const { data: signalTextsData, isLoading: signalTextsLoading } = useSignalTexts(id);

  const signals = signalsData ?? [];
  const signalTexts = signalTextsData ?? [];
  const isLoading = companyLoading || signalsLoading || briefsLoading || briefLoading || signalTextsLoading;

  // Track which brief IDs have been animated (only animate on first render)
  const animatedBriefIdsRef = useRef<Set<string>>(new Set());

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

  // Auto-select latest brief when briefs load
  useEffect(() => {
    if (allBriefs && allBriefs.length > 0 && !selectedBriefId) {
      setSelectedBriefId(allBriefs[0].id);
    }
  }, [allBriefs, selectedBriefId]);

  // Track when brief loads to start sequential reveals
  useEffect(() => {
    if (brief && !animatedBriefIdsRef.current.has(brief.id)) {
      // First time seeing this brief - animate it
      animatedBriefIdsRef.current.add(brief.id);
      
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
    } else if (brief) {
      // Already animated - show everything immediately without animation
      setRevealedSections({
        partnerTake: true,
        keyFactors: true,
        momentum: true,
      });
    } else if (!brief) {
      // Reset when brief is cleared
      setRevealedSections({
        partnerTake: false,
        keyFactors: false,
        momentum: false,
      });
    }
  }, [brief]);

  // Determine if we should animate (only for first render of a brief)
  const shouldAnimate = brief && !animatedBriefIdsRef.current.has(brief.id);

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

  if (companyLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background bg-pattern-arcs flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading company data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (companyError || !company) {
    return (
      <div className="min-h-screen bg-background bg-pattern-arcs flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Company not found</p>
            <Link href="/demo" className="block text-center mt-4 text-accent-highlight hover:underline">
              ← Back to portfolio
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-pattern-arcs">
      {/* Demo Banner */}
      <div className="bg-accent/20 border-b border-border/60 py-3 px-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Demo Mode</span>
            <span className="text-sm text-foreground">Sample company insights and brief</span>
          </div>
          <Link href="/login">
            <span className="text-sm text-accent-highlight hover:underline">Sign in →</span>
          </Link>
        </div>
      </div>

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
              {brief?.partnerTake && revealedSections.partnerTake ? (
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
              {(brief?.confidenceModifiers || brief?.momentumScore !== undefined) && revealedSections.keyFactors ? (
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

            {/* Unified Insights - Combines signal collection and insights display */}
            {company && (
              <UnifiedInsights
                companyId={company.id}
                companyName={company.name}
                signals={signals}
                brief={brief}
                isCollectingSignals={false}
                isGeneratingBrief={false}
                onSignalCollectionComplete={() => {}}
                onSignalsFound={() => {}}
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
              onUpdate={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}
