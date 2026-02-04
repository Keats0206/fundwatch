import type { Signal, Role } from "@/lib/types";

/**
 * Compute benchmarking metrics relative to company's own history
 */

export interface BenchmarkMetrics {
  hiringVelocity: number; // roles_last_14d / roles_prev_14d
  pressSpike: number; // mentions_7d / avg_mentions_30d
  rolesLast14d: number;
  rolesPrev14d: number;
  mentions7d: number;
  avgMentions30d: number;
}

/**
 * Compute hiring velocity: roles in last 14 days vs previous 14 days
 */
export function computeHiringVelocity(roles: Role[]): { velocity: number; last14d: number; prev14d: number } {
  const now = new Date();
  const last14d = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const prev14dStart = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

  const rolesLast14d = roles.filter((r) => {
    const firstSeen = new Date(r.firstSeen);
    return firstSeen >= last14d && (r.status === "new" || r.status === "ongoing");
  }).length;

  const rolesPrev14d = roles.filter((r) => {
    const firstSeen = new Date(r.firstSeen);
    return firstSeen >= prev14dStart && firstSeen < last14d && (r.status === "new" || r.status === "ongoing");
  }).length;

  const velocity = rolesPrev14d > 0 ? rolesLast14d / rolesPrev14d : rolesLast14d > 0 ? Infinity : 0;

  return { velocity, last14d: rolesLast14d, prev14d: rolesPrev14d };
}

/**
 * Compute press spike: mentions in last 7 days vs average mentions per 7 days over last 30 days
 */
export function computePressSpike(signals: Signal[]): { spike: number; mentions7d: number; avgMentions30d: number } {
  const now = new Date();
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const newsSignals = signals.filter((s) => s.source === "News");
  
  const mentions7d = newsSignals.filter((s) => {
    const timestamp = new Date(s.timestamp);
    return timestamp >= last7d;
  }).length;

  const mentions30d = newsSignals.filter((s) => {
    const timestamp = new Date(s.timestamp);
    return timestamp >= last30d;
  }).length;

  // Average mentions per 7-day period over last 30 days
  const avgMentions30d = mentions30d / (30 / 7);
  const spike = avgMentions30d > 0 ? mentions7d / avgMentions30d : mentions7d > 0 ? Infinity : 0;

  return { spike, mentions7d, avgMentions30d };
}

/**
 * Generate benchmarking context text for AI prompts
 */
export function generateBenchmarkContext(metrics: BenchmarkMetrics): string {
  const parts: string[] = [];

  if (metrics.hiringVelocity > 1.5) {
    parts.push(`Hiring velocity is ${metrics.hiringVelocity.toFixed(1)}x above baseline (${metrics.rolesLast14d} roles last 14d vs ${metrics.rolesPrev14d} previous 14d)`);
  } else if (metrics.hiringVelocity < 0.5 && metrics.rolesPrev14d > 0) {
    parts.push(`Hiring velocity is ${metrics.hiringVelocity.toFixed(1)}x below baseline (${metrics.rolesLast14d} roles last 14d vs ${metrics.rolesPrev14d} previous 14d)`);
  }

  if (metrics.pressSpike > 2) {
    parts.push(`Press mentions spiked ${metrics.pressSpike.toFixed(1)}x above 30-day average (${metrics.mentions7d} mentions last 7d)`);
  } else if (metrics.pressSpike < 0.3 && metrics.avgMentions30d > 0) {
    parts.push(`Press mentions dropped to ${metrics.pressSpike.toFixed(1)}x of 30-day average (${metrics.mentions7d} mentions last 7d)`);
  }

  return parts.length > 0 ? `\n\nBENCHMARKING (relative to company's own history):\n${parts.join("\n")}` : "";
}
