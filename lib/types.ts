export type HealthStatus = "green" | "yellow" | "red";

export type SignalSource = "Careers" | "LinkedIn" | "News" | "Blog";

export type RoleStatus = "new" | "removed" | "ongoing";

export type PersonChangeType = "joined" | "left";

export type AlertType =
  | "hiring_pause"
  | "exec_departure"
  | "no_activity"
  | "negative_press"
  | "role_churn";

export type RoleType = "Engineering" | "GTM" | "Leadership" | "Other";

export interface Fund {
  id: string;
  name: string;
}

export interface Company {
  id: string;
  fundId: string;
  name: string;
  domain: string;
  health: HealthStatus;
  lastUpdated: string; // ISO date
  attentionReason?: string;
  highlightChips: string[];
}

export interface Signal {
  id: string;
  companyId: string;
  source: SignalSource;
  timestamp: string; // ISO date
  summary: string;
  externalUrl: string;
}

// Text-based signals that can be injected into prompts
export type SignalTextType = "standard" | "custom";
export type SignalFormat = "text" | "url"; // text = pattern/idea, url = URL to monitor

export interface SignalText {
  id: string;
  companyId: string | null; // null for standard signals, company ID for custom
  text: string; // For text format: the pattern/idea. For url format: the URL to monitor
  format: SignalFormat; // "text" = pattern idea, "url" = URL to monitor
  type: SignalTextType;
  category: string | null; // e.g., "Funding", "Hiring", "Product", etc.
  iconName: string | null; // e.g., "DollarSign", "TrendingUp", etc.
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

export interface Role {
  id: string;
  companyId: string;
  title: string;
  roleType: RoleType;
  source: "LinkedIn" | "Careers";
  firstSeen: string; // ISO date
  status: RoleStatus;
  highPriority?: boolean;
}

export interface PersonChange {
  id: string;
  companyId: string;
  name: string;
  role: string;
  changeType: PersonChangeType;
  sourceUrl: string;
}

export interface Alert {
  id: string;
  companyId: string;
  type: AlertType;
  whyItMatters: string;
  createdAt: string; // ISO date
}

export type PartnerAction = "re-engage" | "monitor" | "ignore";
export type ConfidenceLevel = 0.0 | 0.25 | 0.5 | 0.75 | 1.0;

export interface Evidence {
  source: string;
  url: string;
  extractedAt: string; // ISO date
  quote?: string; // Direct quote from source
}

export interface Insight {
  claim: string;
  kind: "observed" | "inferred";
  confidence: number; // 0-1
  evidence: Evidence[];
  claimType?: string; // e.g., "funding", "hiring_increase", etc.
}

export interface PartnerTake {
  take: string; // 2-4 sentences, assertive
  action: PartnerAction;
  confidence: ConfidenceLevel;
  rationaleBullets: string[]; // max 3
}

export interface Play {
  title: string; // e.g., "Re-engage with partner-intro angle"
  when: string; // trigger condition
  why: string; // 1 sentence
  suggestedMessage?: string; // optional 2-3 lines
}

export interface ConfidenceModifier {
  increases: string; // "If X happens, confidence increases"
  decreases: string; // "If Y happens, confidence decreases"
}

export interface CompanyBrief {
  id: string;
  companyId: string;
  createdAt: string;
  whatChanged: string[];
  whyItMatters: string[];
  risksToWatch: string[];
  whereYouCanHelp: string[];
  questionsForCall: string[];
  /** Optional signal ids for visual linking (e.g. bullet -> signal)
   * Structure: { sectionName: [[signalIds for item 0], [signalIds for item 1], ...] }
   */
  signalIdsBySection?: Partial<Record<string, string[][]>>;
  /** New VC-partner focused fields */
  partnerTake?: PartnerTake;
  insights?: Insight[]; // Observed vs inferred insights with evidence
  plays?: Play[]; // Actionable plays with triggers
  confidenceModifiers?: ConfidenceModifier;
  momentumScore?: number; // Computed momentum score
  momentumStatus?: HealthStatus; // green/yellow/red based on score
}

export type TaskType = "action" | "question";
export type TaskStatus = "pending" | "completed" | "snoozed";

export interface Task {
  id: string;
  companyId: string;
  type: TaskType;
  text: string;
  status: TaskStatus;
  createdAt: string; // ISO date
  section: "whereYouCanHelp" | "questionsForCall";
}

export type TrackedUrlType = "static" | "dynamic";

export interface TrackedUrl {
  id: string;
  companyId: string;
  url: string;
  label: string | null;
  urlType: TrackedUrlType;
  enabled: boolean;
  lastChecked: string | null; // ISO date
  lastContentHash: string | null;
  createdAt: string; // ISO date
}

export interface SignalCache {
  companyId: string;
  lastChecked: string; // ISO date
  signalsGenerated: number;
  urlsChecked: number;
}
