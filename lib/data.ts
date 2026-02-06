/**
 * Unified async data layer. Uses Supabase when configured, otherwise mock data.
 */
import type {
  Fund,
  Company,
  Signal,
  SignalText,
  Role,
  PersonChange,
  Alert,
  CompanyBrief,
  Task,
  PartnerAction,
  ConfidenceLevel,
  HealthStatus,
  TrackedUrl,
  SignalCache,
} from "./types";
import { isSupabaseConfigured, supabase } from "./supabase/client";
import type { DbCompany, DbSignal, DbSignalText, DbRole, DbPersonChange, DbAlert, DbCompanyBrief, DbTask, DbTrackedUrl, DbSignalCache } from "./supabase/types";
import * as mock from "./mock-data";

/** Derive 1–3 default highlight chips from health + attentionReason when none are set. */
function getDefaultHighlightChips(company: {
  health: Company["health"];
  attentionReason?: string;
}): string[] {
  const chips: string[] = [];
  const reason = (company.attentionReason ?? "").toLowerCase();

  // Health-based
  if (company.health === "green") chips.push("Stable");
  else if (company.health === "yellow") chips.push("Needs attention");
  else if (company.health === "red") chips.push("At risk");

  // From attention reason (max 2 more so we stay at 3 total)
  if (chips.length < 3 && /fund|raise|series|capital/.test(reason)) chips.push("Funding");
  if (chips.length < 3 && /hir|role|position|recruit|open|pause/.test(reason)) chips.push("Hiring");
  if (chips.length < 3 && /press|negative|coverage/.test(reason)) chips.push("Press");
  if (chips.length < 3 && /activ|quiet|silent|no activity|weeks/.test(reason)) chips.push("Activity");
  if (chips.length < 3 && /exec|departure|cto|ceo|leadership/.test(reason)) chips.push("Leadership");

  return chips.slice(0, 3);
}

function enrichCompanyWithDefaultChips(company: Company): Company {
  if (company.highlightChips.length > 0) return company;
  return {
    ...company,
    highlightChips: getDefaultHighlightChips(company),
  };
}

function mapCompany(row: DbCompany): Company {
  const company: Company = {
    id: row.id,
    fundId: row.fund_id,
    name: row.name,
    domain: row.domain,
    health: row.health as Company["health"],
    lastUpdated: row.last_updated,
    attentionReason: row.attention_reason ?? undefined,
    highlightChips: row.highlight_chips ?? [],
  };
  return enrichCompanyWithDefaultChips(company);
}

function mapSignal(row: DbSignal): Signal {
  return {
    id: row.id,
    companyId: row.company_id,
    source: row.source as Signal["source"],
    timestamp: row.timestamp,
    summary: row.summary,
    externalUrl: row.external_url,
  };
}

function mapRole(row: DbRole): Role {
  return {
    id: row.id,
    companyId: row.company_id,
    title: row.title,
    roleType: row.role_type as Role["roleType"],
    source: row.source as Role["source"],
    firstSeen: row.first_seen,
    status: row.status as Role["status"],
    highPriority: row.high_priority ?? undefined,
  };
}

function mapPersonChange(row: DbPersonChange): PersonChange {
  return {
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    role: row.role,
    changeType: row.change_type as PersonChange["changeType"],
    sourceUrl: row.source_url,
  };
}

function mapAlert(row: DbAlert): Alert {
  return {
    id: row.id,
    companyId: row.company_id,
    type: row.type as Alert["type"],
    whyItMatters: row.why_it_matters,
    createdAt: row.created_at,
  };
}

function mapBrief(row: DbCompanyBrief): CompanyBrief {
  return {
    id: row.id,
    companyId: row.company_id,
    createdAt: row.created_at,
    whatChanged: row.what_changed ?? [],
    whyItMatters: row.why_it_matters ?? [],
    risksToWatch: row.risks_to_watch ?? [],
    whereYouCanHelp: row.where_you_can_help ?? [],
    questionsForCall: row.questions_for_call ?? [],
    signalIdsBySection: row.signal_ids_by_section ?? undefined,
    partnerTake: row.partner_take ? {
      take: row.partner_take.take,
      action: row.partner_take.action as PartnerAction,
      confidence: row.partner_take.confidence as ConfidenceLevel,
      rationaleBullets: row.partner_take.rationale_bullets,
    } : undefined,
    insights: row.insights?.map((i) => ({
      claim: i.claim,
      kind: i.kind as "observed" | "inferred",
      confidence: i.confidence,
      evidence: i.evidence.map((e) => ({
        source: e.source,
        url: e.url,
        extractedAt: e.extracted_at,
        quote: e.quote,
      })),
      claimType: i.claim_type,
    })),
    plays: row.plays?.map((p) => ({
      title: p.title,
      when: p.when,
      why: p.why,
      suggestedMessage: p.suggested_message,
    })),
    confidenceModifiers: row.confidence_modifiers ? {
      increases: row.confidence_modifiers.increases,
      decreases: row.confidence_modifiers.decreases,
    } : undefined,
    momentumScore: row.momentum_score ?? undefined,
    momentumStatus: (row.momentum_status as HealthStatus | null) ?? undefined,
  };
}

function mapTask(row: DbTask): Task {
  return {
    id: row.id,
    companyId: row.company_id,
    type: row.type as Task["type"],
    text: row.text,
    status: row.status as Task["status"],
    createdAt: row.created_at,
    section: row.section as Task["section"],
  };
}

// --- Async API (Supabase or mock) ---

let dataSourceLogged = false;
function logDataSource(source: "supabase" | "mock") {
  if (!dataSourceLogged) {
    console.log("[FundWatch data] Using", source);
    dataSourceLogged = true;
  }
}

function logFallback(label: string, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  console.warn("[FundWatch data] Supabase unreachable, using mock data for", label, "—", msg);
}

export async function getFunds(): Promise<Fund[]> {
  if (!isSupabaseConfigured() || !supabase) {
    logDataSource("mock");
    return Promise.resolve(mock.getFunds());
  }
  logDataSource("supabase");
  try {
    const { data, error } = await supabase.from("funds").select("id, name").order("name");
    if (error) throw error;
    return (data ?? []) as Fund[];
  } catch (err) {
    logFallback("getFunds", err);
    return mock.getFunds();
  }
}

export async function getFund(id: string): Promise<Fund | undefined> {
  if (!isSupabaseConfigured() || !supabase) {
    logDataSource("mock");
    return Promise.resolve(mock.getFund(id));
  }
  logDataSource("supabase");
  try {
    const { data, error } = await supabase.from("funds").select("id, name").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return undefined;
      throw error;
    }
    return data as Fund;
  } catch (err) {
    logFallback("getFund", err);
    return mock.getFund(id);
  }
}

export async function getCompanies(fundId?: string): Promise<Company[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return Promise.resolve(mock.getCompanies(fundId).map(enrichCompanyWithDefaultChips));
  }
  try {
    let q = supabase.from("companies").select("*").order("last_updated", { ascending: false });
    if (fundId) q = q.eq("fund_id", fundId);
    const { data, error } = await q;
    if (error) throw error;
    return ((data ?? []) as DbCompany[]).map(mapCompany);
  } catch (err) {
    logFallback("getCompanies", err);
    return mock.getCompanies(fundId).map(enrichCompanyWithDefaultChips);
  }
}

export async function getCompany(id: string): Promise<Company | undefined> {
  if (!isSupabaseConfigured() || !supabase) {
    const c = mock.getCompany(id);
    return Promise.resolve(c ? enrichCompanyWithDefaultChips(c) : undefined);
  }
  try {
    const { data, error } = await supabase.from("companies").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return undefined;
      throw error;
    }
    const company = data ? mapCompany(data as DbCompany) : undefined;
    return company;
  } catch (err) {
    logFallback("getCompany", err);
    const c = mock.getCompany(id);
    return c ? enrichCompanyWithDefaultChips(c) : undefined;
  }
}

export async function getSignals(companyId: string): Promise<Signal[]> {
  // Check if this is a demo company - always use mock data for demo
  const company = await getCompany(companyId);
  if (company?.fundId === "demo") {
    return Promise.resolve(mock.getSignals(companyId));
  }
  
  if (!isSupabaseConfigured() || !supabase) {
    return Promise.resolve(mock.getSignals(companyId));
  }
  try {
    const { data, error } = await supabase
      .from("signals")
      .select("*")
      .eq("company_id", companyId)
      .order("timestamp", { ascending: false });
    if (error) throw error;
    const signals = ((data ?? []) as DbSignal[]).map(mapSignal);
    // If no signals found and this might be a demo company, fall back to mock
    if (signals.length === 0) {
      const mockSignals = mock.getSignals(companyId);
      if (mockSignals.length > 0) return mockSignals;
    }
    return signals;
  } catch (err) {
    logFallback("getSignals", err);
    return mock.getSignals(companyId);
  }
}

export async function getRoles(companyId: string): Promise<Role[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return Promise.resolve(mock.getRoles(companyId));
  }
  try {
    const { data, error } = await supabase.from("roles").select("*").eq("company_id", companyId);
    if (error) throw error;
    return ((data ?? []) as DbRole[]).map(mapRole);
  } catch (err) {
    logFallback("getRoles", err);
    return mock.getRoles(companyId);
  }
}

export async function getPeopleChanges(companyId: string): Promise<PersonChange[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return Promise.resolve(mock.getPeopleChanges(companyId));
  }
  try {
    const { data, error } = await supabase.from("person_changes").select("*").eq("company_id", companyId);
    if (error) throw error;
    return ((data ?? []) as DbPersonChange[]).map(mapPersonChange);
  } catch (err) {
    logFallback("getPeopleChanges", err);
    return mock.getPeopleChanges(companyId);
  }
}

export async function getAlerts(fundId?: string): Promise<Alert[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return Promise.resolve(mock.getAlerts(fundId));
  }
  try {
    const companyIds = fundId ? (await getCompanies(fundId)).map((c) => c.id) : null;
    let q = supabase.from("alerts").select("*").order("created_at", { ascending: false });
    if (companyIds?.length) q = q.in("company_id", companyIds);
    const { data, error } = await q;
    if (error) throw error;
    return ((data ?? []) as DbAlert[]).map(mapAlert);
  } catch (err) {
    logFallback("getAlerts", err);
    return mock.getAlerts(fundId);
  }
}

export async function getOpenRolesForFund(fundId: string): Promise<(Role & { company: Company })[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return Promise.resolve(mock.getOpenRolesForFund(fundId));
  }
  try {
    const companies = await getCompanies(fundId);
    const companyIds = companies.map((c) => c.id);
    if (companyIds.length === 0) return [];
    const { data: rolesData, error: rolesError } = await supabase
      .from("roles")
      .select("*")
      .in("company_id", companyIds)
      .in("status", ["new", "ongoing"]);
    if (rolesError) throw rolesError;
    const roles = (rolesData ?? []) as DbRole[];
    const companyMap = new Map(companies.map((c) => [c.id, c]));
    return roles
      .map((r) => {
        const company = companyMap.get(r.company_id);
        if (!company) return null;
        return { ...mapRole(r), company };
      })
      .filter((r): r is Role & { company: Company } => r !== null);
  } catch (err) {
    logFallback("getOpenRolesForFund", err);
    return mock.getOpenRolesForFund(fundId);
  }
}

export async function getBrief(companyId: string, briefId?: string): Promise<CompanyBrief | undefined> {
  // Check if this is a demo company - always use mock data for demo
  const company = await getCompany(companyId);
  if (company?.fundId === "demo") {
    return Promise.resolve(mock.getBrief(companyId, briefId));
  }
  
  if (!isSupabaseConfigured() || !supabase) {
    return Promise.resolve(mock.getBrief(companyId, briefId));
  }
  try {
    let query = supabase.from("company_briefs").select("*").eq("company_id", companyId);
    
    if (briefId) {
      // Fetch specific brief by ID
      query = query.eq("id", briefId);
    } else {
      // Fetch latest brief (default behavior)
      query = query.order("created_at", { ascending: false }).limit(1);
    }
    
    const { data, error } = await query.maybeSingle();
    if (error) {
      if (error.code === "PGRST116") {
        // No brief found - check mock data for demo companies
        return mock.getBrief(companyId, briefId);
      }
      throw error;
    }
    const brief = data ? mapBrief(data as DbCompanyBrief) : undefined;
    // If no brief found and this might be a demo company, fall back to mock
    if (!brief) {
      const mockBrief = mock.getBrief(companyId, briefId);
      if (mockBrief) return mockBrief;
    }
    return brief;
  } catch (err) {
    logFallback("getBrief", err);
    return mock.getBrief(companyId, briefId);
  }
}

export async function getAllBriefs(companyId: string): Promise<CompanyBrief[]> {
  // Check if this is a demo company - always use mock data for demo
  const company = await getCompany(companyId);
  if (company?.fundId === "demo") {
    return Promise.resolve(mock.getAllBriefs(companyId));
  }
  
  if (!isSupabaseConfigured() || !supabase) {
    return Promise.resolve(mock.getAllBriefs(companyId));
  }
  try {
    const { data, error } = await supabase
      .from("company_briefs")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const briefs = ((data ?? []) as DbCompanyBrief[]).map(mapBrief);
    // If no briefs found and this might be a demo company, fall back to mock
    if (briefs.length === 0) {
      const mockBriefs = mock.getAllBriefs(companyId);
      if (mockBriefs.length > 0) return mockBriefs;
    }
    return briefs;
  } catch (err) {
    logFallback("getAllBriefs", err);
    return mock.getAllBriefs(companyId);
  }
}

export async function getAttentionCompanies(fundId: string): Promise<Company[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return Promise.resolve(mock.getAttentionCompanies(fundId));
  }
  const companies = await getCompanies(fundId);
  return companies.filter(
    (c) => c.health === "red" || c.health === "yellow" || c.attentionReason
  );
}

export type MotionType = "capital_event" | "hiring_inflection" | "silent_risk" | "product_update" | "leadership_change";

export interface WeeklyMotion {
  totalCompanies: number;
  capitalEvents: number;
  hiringInflections: number;
  silentRiskSignals: number;
  productUpdates: number;
  leadershipChanges: number;
  companiesByMotion: Array<{
    companyId: string;
    companyName: string;
    motionTypes: MotionType[];
    latestSignal: string;
  }>;
}

export async function getWeeklyMotion(fundId: string): Promise<WeeklyMotion> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      totalCompanies: 0,
      capitalEvents: 0,
      hiringInflections: 0,
      silentRiskSignals: 0,
      productUpdates: 0,
      leadershipChanges: 0,
      companiesByMotion: [],
    };
  }

  try {
    const companies = await getCompanies(fundId);
    if (companies.length === 0) {
      return {
        totalCompanies: 0,
        capitalEvents: 0,
        hiringInflections: 0,
        silentRiskSignals: 0,
        productUpdates: 0,
        leadershipChanges: 0,
        companiesByMotion: [],
      };
    }

    const companyIds = companies.map((c) => c.id);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoISO = weekAgo.toISOString();

    const { data: signalsData, error } = await supabase
      .from("signals")
      .select("*")
      .in("company_id", companyIds)
      .gte("timestamp", weekAgoISO)
      .order("timestamp", { ascending: false });

    if (error) throw error;

    const signals = (signalsData ?? []) as DbSignal[];
    const companyMap = new Map(companies.map((c) => [c.id, c]));

    // Categorize signals by motion type
    const motionByCompany = new Map<
      string,
      { types: Set<MotionType>; latestSignal: string }
    >();

    for (const signal of signals) {
      const company = companyMap.get(signal.company_id);
      if (!company) continue;

      const summary = signal.summary.toLowerCase();
      let motionType: MotionType | null = null;

      // Capital events
      if (
        summary.includes("funding") ||
        summary.includes("raised") ||
        summary.includes("series") ||
        summary.includes("round") ||
        summary.includes("capital") ||
        signal.source === "News" && (summary.includes("$") || summary.includes("million") || summary.includes("billion"))
      ) {
        motionType = "capital_event";
      }
      // Hiring inflections
      else if (
        signal.source === "Careers" ||
        (signal.source === "LinkedIn" && (summary.includes("hiring") || summary.includes("role") || summary.includes("position")))
      ) {
        motionType = "hiring_inflection";
      }
      // Silent risk (removed roles, no activity)
      else if (
        summary.includes("removed") ||
        summary.includes("no activity") ||
        summary.includes("silent") ||
        summary.includes("stopped")
      ) {
        motionType = "silent_risk";
      }
      // Product updates
      else if (
        signal.source === "Blog" ||
        (summary.includes("launch") || summary.includes("product") || summary.includes("feature"))
      ) {
        motionType = "product_update";
      }
      // Leadership changes
      else if (
        summary.includes("cto") ||
        summary.includes("ceo") ||
        summary.includes("cfo") ||
        summary.includes("joined") ||
        summary.includes("left") ||
        summary.includes("departure")
      ) {
        motionType = "leadership_change";
      }

      if (motionType) {
        const existing = motionByCompany.get(signal.company_id);
        if (existing) {
          existing.types.add(motionType);
          if (signal.timestamp > existing.latestSignal) {
            existing.latestSignal = signal.timestamp;
          }
        } else {
          motionByCompany.set(signal.company_id, {
            types: new Set([motionType]),
            latestSignal: signal.timestamp,
          });
        }
      }
    }

    // Count motion types
    let capitalEvents = 0;
    let hiringInflections = 0;
    let silentRiskSignals = 0;
    let productUpdates = 0;
    let leadershipChanges = 0;

    const companiesByMotion: WeeklyMotion["companiesByMotion"] = [];

    for (const [companyId, motion] of motionByCompany.entries()) {
      const company = companyMap.get(companyId);
      if (!company) continue;

      const types = Array.from(motion.types);
      companiesByMotion.push({
        companyId,
        companyName: company.name,
        motionTypes: types,
        latestSignal: motion.latestSignal,
      });

      if (types.includes("capital_event")) capitalEvents++;
      if (types.includes("hiring_inflection")) hiringInflections++;
      if (types.includes("silent_risk")) silentRiskSignals++;
      if (types.includes("product_update")) productUpdates++;
      if (types.includes("leadership_change")) leadershipChanges++;
    }

    return {
      totalCompanies: companiesByMotion.length,
      capitalEvents,
      hiringInflections,
      silentRiskSignals,
      productUpdates,
      leadershipChanges,
      companiesByMotion: companiesByMotion.sort(
        (a, b) => new Date(b.latestSignal).getTime() - new Date(a.latestSignal).getTime()
      ),
    };
  } catch (err) {
    logFallback("getWeeklyMotion", err);
    return {
      totalCompanies: 0,
      capitalEvents: 0,
      hiringInflections: 0,
      silentRiskSignals: 0,
      productUpdates: 0,
      leadershipChanges: 0,
      companiesByMotion: [],
    };
  }
}

export async function getTasks(
  fundId?: string,
  status?: Task["status"]
): Promise<(Task & { company: Company })[]> {
  if (!isSupabaseConfigured() || !supabase) {
    const mockTasks = mock.getTasks(fundId, status);
    const companies = await getCompanies(fundId);
    const companyMap = new Map(companies.map(c => [c.id, c]));
    return mockTasks
      .map(task => {
        const company = companyMap.get(task.companyId);
        return company ? { ...task, company } : null;
      })
      .filter((t): t is Task & { company: Company } => t !== null);
  }
  try {
    const companyIds = fundId ? (await getCompanies(fundId)).map((c) => c.id) : null;
    let q = supabase.from("tasks").select("*").order("created_at", { ascending: false });
    if (companyIds?.length) q = q.in("company_id", companyIds);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) throw error;
    const tasks = (data ?? []) as DbTask[];
    const companyMap = new Map<string, Company>();
    for (const t of tasks) {
      if (!companyMap.has(t.company_id)) {
        const c = await getCompany(t.company_id);
        if (c) companyMap.set(t.company_id, c);
      }
    }
    return tasks
      .map((t) => {
        const company = companyMap.get(t.company_id);
        if (!company) return null;
        return { ...mapTask(t), company };
      })
      .filter((t): t is Task & { company: Company } => t !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    logFallback("getTasks", err);
    const mockTasks = mock.getTasks(fundId, status);
    const companies = await getCompanies(fundId);
    const companyMap = new Map(companies.map(c => [c.id, c]));
    return mockTasks
      .map(task => {
        const company = companyMap.get(task.companyId);
        return company ? { ...task, company } : null;
      })
      .filter((t): t is Task & { company: Company } => t !== null);
  }
}

export async function getTasksForCompany(companyId: string): Promise<Task[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return Promise.resolve(mock.getTasksForCompany(companyId));
  }
  try {
    const { data, error } = await supabase.from("tasks").select("*").eq("company_id", companyId);
    if (error) throw error;
    return ((data ?? []) as DbTask[]).map(mapTask);
  } catch (err) {
    logFallback("getTasksForCompany", err);
    return mock.getTasksForCompany(companyId);
  }
}

// Tracked URLs
function mapTrackedUrl(row: DbTrackedUrl): TrackedUrl {
  return {
    id: row.id,
    companyId: row.company_id,
    url: row.url,
    label: row.label ?? null,
    urlType: row.url_type as TrackedUrl["urlType"],
    enabled: row.enabled,
    lastChecked: row.last_checked ?? null,
    lastContentHash: row.last_content_hash ?? null,
    createdAt: row.created_at,
  };
}

function mapSignalCache(row: DbSignalCache): SignalCache {
  return {
    companyId: row.company_id,
    lastChecked: row.last_checked,
    signalsGenerated: row.signals_generated,
    urlsChecked: row.urls_checked,
  };
}

function mapSignalText(row: DbSignalText): SignalText {
  return {
    id: row.id,
    companyId: row.company_id,
    text: row.text,
    format: (row.format || "text") as SignalText["format"], // Default to "text" for backward compatibility
    type: row.type as SignalText["type"],
    category: row.category ?? null,
    iconName: row.icon_name ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getTrackedUrls(companyId: string): Promise<TrackedUrl[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return Promise.resolve([]);
  }
  try {
    const { data, error } = await supabase
      .from("company_tracked_urls")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as DbTrackedUrl[]).map(mapTrackedUrl);
  } catch (err) {
    logFallback("getTrackedUrls", err);
    return [];
  }
}

export async function getSignalCache(companyId: string): Promise<SignalCache | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }
  try {
    const { data, error } = await supabase
      .from("company_signal_cache")
      .select("*")
      .eq("company_id", companyId)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data ? mapSignalCache(data as DbSignalCache) : null;
  } catch (err) {
    logFallback("getSignalCache", err);
    return null;
  }
}

/**
 * Get all signal texts for a company (standard + custom)
 */
export async function getSignalTexts(companyId: string | null): Promise<SignalText[]> {
  // Check if this is a demo company - always use mock data for demo
  if (companyId) {
    const company = await getCompany(companyId);
    if (company?.fundId === "demo") {
      return Promise.resolve(mock.getSignalTexts(companyId));
    }
  }
  
  if (!isSupabaseConfigured() || !supabase) {
    return Promise.resolve(companyId ? mock.getSignalTexts(companyId) : mock.getStandardSignalTexts());
  }
  try {
    // Get standard signals (company_id is null) and custom signals for this company
    const queries = [
      supabase
        .from("signal_texts")
        .select("*")
        .eq("type", "standard")
        .is("company_id", null),
    ];
    
    if (companyId) {
      queries.push(
        supabase
          .from("signal_texts")
          .select("*")
          .eq("type", "custom")
          .eq("company_id", companyId)
      );
    }
    
    const results = await Promise.all(queries);
    const allRows: DbSignalText[] = [];
    
    for (const result of results) {
      if (result.error) throw result.error;
      if (result.data) {
        allRows.push(...(result.data as DbSignalText[]));
      }
    }
    
    const signalTexts = allRows.map(mapSignalText);
    // If no signal texts found and this might be a demo company, fall back to mock
    if (signalTexts.length === 0 && companyId) {
      const mockSignalTexts = mock.getSignalTexts(companyId);
      if (mockSignalTexts.length > 0) return mockSignalTexts;
    }
    return signalTexts;
  } catch (err) {
    logFallback("getSignalTexts", err);
    return companyId ? mock.getSignalTexts(companyId) : mock.getStandardSignalTexts();
  }
}

/**
 * Get only standard signal texts (reusable across companies)
 */
export async function getStandardSignalTexts(): Promise<SignalText[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return Promise.resolve([]);
  }
  try {
    const { data, error } = await supabase
      .from("signal_texts")
      .select("*")
      .eq("type", "standard")
      .is("company_id", null)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return ((data ?? []) as DbSignalText[]).map(mapSignalText);
  } catch (err) {
    logFallback("getStandardSignalTexts", err);
    return [];
  }
}

/**
 * Create a custom signal text for a company
 */
export async function createSignalText(
  companyId: string,
  text: string,
  format: SignalText["format"] = "text",
  category?: string | null,
  iconName?: string | null
): Promise<SignalText> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }
  const id = `st-custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from("signal_texts")
    .insert({
      id,
      company_id: companyId,
      text,
      format,
      category: category ?? null,
      icon_name: iconName ?? null,
      type: "custom",
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();
  
  if (error) throw error;
  return mapSignalText(data as DbSignalText);
}

/**
 * Create a standard signal text (for all companies)
 */
export async function createStandardSignalText(
  text: string,
  format: SignalText["format"] = "text",
  category?: string | null,
  iconName?: string | null
): Promise<SignalText> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }
  const id = `st-standard-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from("signal_texts")
    .insert({
      id,
      company_id: null,
      text,
      format,
      category: category ?? null,
      icon_name: iconName ?? null,
      type: "standard",
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();
  
  if (error) throw error;
  return mapSignalText(data as DbSignalText);
}

/**
 * Update a signal text
 */
export async function updateSignalText(
  id: string,
  text: string,
  format: SignalText["format"] = "text"
): Promise<SignalText> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }
  
  const { data, error } = await supabase
    .from("signal_texts")
    .update({ text, format, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return mapSignalText(data as DbSignalText);
}

/**
 * Delete a signal text
 */
export async function deleteSignalText(id: string): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }
  
  const { error } = await supabase
    .from("signal_texts")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
}
