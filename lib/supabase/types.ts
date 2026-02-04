/**
 * Supabase table row types (snake_case). Map to app types in data.ts.
 */
export type DbFund = { id: string; name: string };

export type DbCompany = {
  id: string;
  fund_id: string;
  name: string;
  domain: string;
  health: string;
  last_updated: string;
  attention_reason: string | null;
  highlight_chips: string[];
};

export type DbSignal = {
  id: string;
  company_id: string;
  source: string;
  timestamp: string;
  summary: string;
  external_url: string;
};

export type DbRole = {
  id: string;
  company_id: string;
  title: string;
  role_type: string;
  source: string;
  first_seen: string;
  status: string;
  high_priority: boolean | null;
};

export type DbPersonChange = {
  id: string;
  company_id: string;
  name: string;
  role: string;
  change_type: string;
  source_url: string;
};

export type DbAlert = {
  id: string;
  company_id: string;
  type: string;
  why_it_matters: string;
  created_at: string;
};

export type DbCompanyBrief = {
  id: string;
  company_id: string;
  created_at: string;
  what_changed: string[];
  why_it_matters: string[];
  risks_to_watch: string[];
  where_you_can_help: string[];
  questions_for_call: string[];
  signal_ids_by_section: Record<string, string[][]> | null;
  partner_take: {
    take: string;
    action: string;
    confidence: number;
    rationale_bullets: string[];
  } | null;
  insights: Array<{
    claim: string;
    kind: string;
    confidence: number;
    evidence: Array<{
      source: string;
      url: string;
      extracted_at: string;
      quote?: string;
    }>;
    claim_type?: string;
  }> | null;
  plays: Array<{
    title: string;
    when: string;
    why: string;
    suggested_message?: string;
  }> | null;
  confidence_modifiers: {
    increases: string;
    decreases: string;
  } | null;
  momentum_score: number | null;
  momentum_status: string | null;
};

export type DbTask = {
  id: string;
  company_id: string;
  type: string;
  text: string;
  status: string;
  created_at: string;
  section: string;
};

export type DbTrackedUrl = {
  id: string;
  company_id: string;
  url: string;
  label: string | null;
  url_type: string;
  enabled: boolean;
  last_checked: string | null;
  last_content_hash: string | null;
  created_at: string;
};

export type DbSignalCache = {
  company_id: string;
  last_checked: string;
  signals_generated: number;
  urls_checked: number;
};

export type DbSignalText = {
  id: string;
  company_id: string | null;
  text: string;
  format: string; // "text" or "url"
  type: string;
  category: string | null;
  icon_name: string | null;
  created_at: string;
  updated_at: string;
};
