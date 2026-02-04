"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Users, Rocket, ExternalLink, Search } from "lucide-react";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { SourceBadge } from "@/components/source-badge";

// Fake data for placeholder
const fakeSignals = [
  {
    id: "fake-1",
    companyId: "fake",
    source: "News" as const,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    summary: "Company announced a $50M Series B funding round led by prominent VCs, signaling strong growth trajectory and market validation.",
    externalUrl: "https://example.com/news",
  },
  {
    id: "fake-2",
    companyId: "fake",
    source: "Careers" as const,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    summary: "Added 12 new engineering roles across backend, frontend, and DevOps teams, indicating aggressive scaling plans.",
    externalUrl: "https://example.com/careers",
  },
  {
    id: "fake-3",
    companyId: "fake",
    source: "Blog" as const,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    summary: "Launched new enterprise product feature targeting Fortune 500 companies, expanding market reach.",
    externalUrl: "https://example.com/blog",
  },
];

const fakeWhyItMatters = [
  "The Series B funding suggests strong investor confidence and provides runway for aggressive expansion, positioning them well in a competitive market.",
  "The hiring surge across engineering indicates they're building capacity for product development, which could accelerate their roadmap significantly.",
  "The enterprise feature launch represents a strategic pivot toward higher-value customers, potentially improving unit economics and reducing churn risk.",
];

const fakeRecommendedSteps = [
  {
    title: "Schedule a strategic check-in",
    why: "Recent funding and hiring momentum suggests this is an ideal time to discuss their roadmap and see how we can add value.",
    when: "Within the next 2 weeks",
    suggestedMessage: "Hey! Saw the Series B announcement - congrats! Would love to catch up on your plans and see how we can help with [specific area]. Free for a quick call this week?",
  },
  {
    title: "Offer GTM introductions",
    why: "The enterprise pivot suggests they're expanding their go-to-market efforts and could benefit from strategic customer introductions.",
    when: "After confirming their target customer profile",
  },
];

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

export function UnifiedInsightsPlaceholder() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSections, setShowSections] = useState(false);

  const simulateLoading = async () => {
    setIsLoading(true);
    setShowSections(false);
    
    // Simulate collection phase (3 seconds)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate brief generation phase (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setShowSections(true);
  };

  return (
    <div className="space-y-4">
      {/* Simulate Button */}
      <div className="flex items-center gap-2">
        <Button
          onClick={simulateLoading}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? (
            <Shimmer as="span" duration={2}>Simulating...</Shimmer>
          ) : (
            "Simulate Loading Experience"
          )}
        </Button>
        {showSections && !isLoading && (
          <Button
            onClick={() => {
              setShowSections(false);
              setIsLoading(false);
            }}
            variant="ghost"
            size="sm"
          >
            Reset
          </Button>
        )}
      </div>

      <Card className="border-border/60">
        <CardContent className="p-6">
          {/* Collection Status Banner - shown when loading */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 pb-6 border-b border-border/40"
            >
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Search className="h-4 w-4 text-muted-foreground mt-0.5" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    <Shimmer as="span" duration={2}>Checking hiring, product updates, and news…</Shimmer>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Monitoring company's site, hiring pages, and public news
                  </p>
                </div>
              </div>

              {/* Show checked URLs summary */}
              <div className="mt-4 pt-4 border-t border-border/40">
                <p className="text-xs text-muted-foreground mb-1.5">
                  Checked 3 sources:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-accent-highlight/20 text-accent-highlight">
                    ● /careers
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-muted/50 text-muted-foreground">
                    /blog
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-muted/50 text-muted-foreground">
                    /news
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Recent Activity Section - Only show after loading */}
          {showSections && (
            <AnimatePresence mode="wait">
              <motion.div
                key="activity-section"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>
                    <p className="text-base text-muted-foreground mt-1">
                      Automated detections from news, career pages, LinkedIn, and blog posts
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {fakeSignals.map((signal, idx) => (
                    <motion.div
                      key={signal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3 pb-4 border-b border-border/60 last:border-0 last:pb-0"
                    >
                      <div className="shrink-0 mt-0.5">
                        {signal.source === "News" && <Sparkles className="h-5 w-5 text-amber-500" />}
                        {signal.source === "Careers" && <TrendingUp className="h-5 w-5 text-blue-500" />}
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
              </motion.div>
            </AnimatePresence>
          )}

          {/* Why It Matters Section - Only show after loading */}
          {showSections && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 border-t border-border/40 pt-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold tracking-tight">Why It Matters</h2>
              </div>

              <ul className="space-y-4">
                {fakeWhyItMatters.map((item, idx) => (
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
                      <SourceBadge signals={fakeSignals.slice(0, 1)} count={1} />
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Recommended Next Steps Section - Only show after loading */}
          {showSections && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-t border-border/40 pt-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold tracking-tight">Recommended Next Steps</h2>
              </div>

              <div className="space-y-4">
                {fakeRecommendedSteps.map((step, idx) => (
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
                        <h3 className="text-base font-semibold text-foreground mb-1.5">{step.title}</h3>
                        <p className="text-base text-muted-foreground mb-2">{step.why}</p>
                        <p className="text-sm text-muted-foreground italic">When: {step.when}</p>
                        {step.suggestedMessage && (
                          <div className="mt-3 p-3 bg-muted/50 rounded text-base text-foreground/80">
                            <p className="font-medium mb-1.5">Suggested message:</p>
                            <p className="whitespace-pre-wrap leading-relaxed">{step.suggestedMessage}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
