"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shimmer } from "./shimmer";
import { motion } from "framer-motion";

export function PartnerTakeSkeleton() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight">Partner Take</h2>
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 bg-muted rounded animate-pulse" />
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        </div>
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-full animate-pulse" />
            <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-muted rounded w-4/6 animate-pulse" />
          </div>
          <div className="mt-4 pt-3 border-t border-border/40 space-y-2">
            <div className="h-3 bg-muted rounded w-full animate-pulse" />
            <div className="h-3 bg-muted rounded w-4/5 animate-pulse" />
            <div className="h-3 bg-muted rounded w-3/5 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}

export function KeyFactorsSkeleton() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-semibold tracking-tight mb-4">Key Factors</h2>
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5 text-sm">↑</span>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-full animate-pulse" />
                <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5 text-sm">↓</span>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-full animate-pulse" />
                <div className="h-4 bg-muted rounded w-4/6 animate-pulse" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}

export function MomentumSkeleton() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight">Momentum</h2>
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-6 w-16 bg-muted rounded animate-pulse" />
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="h-8 w-12 bg-muted rounded animate-pulse mb-2" />
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-full animate-pulse mb-2" />
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}

export function ActionsSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-8 pt-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold tracking-tight">What You Can Do</h2>
        <Shimmer as="span" duration={2}>Generating actions...</Shimmer>
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 rounded-lg border border-border/60 bg-muted/20"
          >
            <div className="flex items-start gap-3 flex-1 min-w-0 pl-1">
              <div className="shrink-0 mt-0.5 rounded-md p-1.5 bg-muted w-7 h-7 animate-pulse" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-muted rounded w-full animate-pulse" />
                <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                <div className="h-6 w-32 bg-muted rounded-full animate-pulse mt-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function WhyItMattersSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-8 pt-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold tracking-tight">Why It Matters</h2>
        <Shimmer as="span" duration={2}>Generating insights...</Shimmer>
      </div>
      <ul className="space-y-4">
        {[1, 2, 3, 4].map((idx) => (
          <li
            key={idx}
            className="flex items-start gap-3 pb-3 border-b border-border/40 last:border-0 last:pb-0"
          >
            <span className="text-accent-highlight mt-0.5 text-sm">•</span>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-4 bg-muted rounded w-full animate-pulse" />
              <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
              <div className="h-5 w-20 bg-muted rounded-full animate-pulse mt-2" />
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function SourcesSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-8 pt-8 border-t border-border/40"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <div className="h-3.5 w-3.5 bg-muted rounded animate-pulse" />
        <div className="h-4 w-16 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="h-7 w-24 bg-muted rounded-full animate-pulse"
          />
        ))}
      </div>
    </motion.div>
  );
}
