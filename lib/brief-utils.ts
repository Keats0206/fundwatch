import type { Insight, HealthStatus, PartnerAction, ConfidenceLevel } from "@/lib/types";

// Signal weights for momentum scoring
export const WEIGHTS: Record<string, number> = {
  funding: 3,
  hiring_increase: 2,
  exec_hire: 2,
  product_launch: 1.5,
  partnership: 1,
  hiring_freeze: -3,
  negative_press: -2.5,
  leadership_churn: -2,
};

/**
 * Compute momentum score from insights
 */
export function computeMomentum(insights: Insight[]): number {
  return insights.reduce((sum, i) => {
    const w = i.claimType ? (WEIGHTS[i.claimType] ?? 0) : 0;
    return sum + w * i.confidence;
  }, 0);
}

/**
 * Determine status from momentum score
 */
export function getMomentumStatus(score: number): HealthStatus {
  if (score >= 4) return "green";
  if (score >= 1.5) return "yellow";
  return "red";
}

/**
 * Quality gates - validate insights before showing them
 */
export function validateInsights(insights: Insight[]): Insight[] {
  return insights.filter((insight) => {
    // Don't claim "raised funding" unless:
    // - source is reputable OR at least 2 independent sources
    if (insight.claimType === "funding") {
      const reputableSources = ["TechCrunch", "The Information", "Bloomberg", "WSJ", "Forbes"];
      const hasReputableSource = insight.evidence.some((e) =>
        reputableSources.some((rs) => e.source.toLowerCase().includes(rs.toLowerCase()))
      );
      const hasMultipleSources = insight.evidence.length >= 2;
      
      if (!hasReputableSource && !hasMultipleSources) {
        return false;
      }
    }

    // Don't infer "aggressive scaling" from hiring unless:
    // - roles increased significantly AND persists
    if (insight.claimType === "hiring_increase" && insight.kind === "inferred") {
      if (insight.confidence < 0.7 || insight.evidence.length < 2) {
        return false;
      }
    }

    // Don't show insights unless confidence >= 0.6 OR evidence count >= 2
    if (insight.confidence < 0.6 && insight.evidence.length < 2) {
      return false;
    }

    return true;
  });
}

/**
 * Convert confidence number to ConfidenceLevel
 */
export function toConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.875) return 1.0;
  if (confidence >= 0.625) return 0.75;
  if (confidence >= 0.375) return 0.5;
  if (confidence >= 0.125) return 0.25;
  return 0.0;
}

/**
 * Determine partner action from momentum and signals
 */
export function determinePartnerAction(momentumScore: number, hasHighPrioritySignals: boolean): PartnerAction {
  if (momentumScore >= 4 || hasHighPrioritySignals) {
    return "re-engage";
  }
  if (momentumScore >= 1.5) {
    return "monitor";
  }
  return "ignore";
}
