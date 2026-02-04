/**
 * Mock data for development/testing when Supabase is not configured.
 */
import type { Fund, Company, Signal, Role, PersonChange, Alert, CompanyBrief, Task, SignalText } from "./types";

const funds: Fund[] = [
  { id: "mantis-ventures", name: "Mantis Ventures" },
  { id: "thrive", name: "Thrive" },
  { id: "usv", name: "USV" },
];

const companies: Company[] = [
  { id: "c1", fundId: "mantis-ventures", name: "Rogo", domain: "rogo.ai", health: "yellow", lastUpdated: "2025-01-28T12:00:00Z", attentionReason: "Hiring pause detected", highlightChips: ["Series A", "Hiring"] },
  { id: "c2", fundId: "mantis-ventures", name: "Acme Corp", domain: "acme.com", health: "green", lastUpdated: "2025-01-27T15:00:00Z", highlightChips: ["Series B"] },
  { id: "c3", fundId: "mantis-ventures", name: "TechStart", domain: "techstart.io", health: "green", lastUpdated: "2025-01-29T10:00:00Z", highlightChips: ["Seed"] },
  { id: "c4", fundId: "thrive", name: "GrowthCo", domain: "growthco.com", health: "red", lastUpdated: "2025-01-25T17:00:00Z", attentionReason: "Negative press", highlightChips: ["Series A"] },
  { id: "c5", fundId: "thrive", name: "ScaleUp", domain: "scaleup.ai", health: "green", lastUpdated: "2025-01-26T09:00:00Z", highlightChips: ["Series B", "Hiring"] },
  { id: "c6", fundId: "usv", name: "InnovateLab", domain: "innovatelab.com", health: "yellow", lastUpdated: "2025-01-22T00:00:00Z", attentionReason: "No activity for 6 weeks", highlightChips: [] },
  { id: "c7", fundId: "usv", name: "DataFlow", domain: "dataflow.io", health: "green", lastUpdated: "2025-01-28T14:00:00Z", highlightChips: ["Series A", "Hiring"] },
  { id: "c8", fundId: "mantis-ventures", name: "CloudSync", domain: "cloudsync.com", health: "yellow", lastUpdated: "2025-01-24T00:00:00Z", attentionReason: "Head of Sales role open 60+ days", highlightChips: ["Series A"] },
];

const signals: Signal[] = [
  { id: "s1", companyId: "c1", source: "Careers", timestamp: "2025-01-28T10:00:00Z", summary: "Two roles removed: Senior Engineer, Product Manager", externalUrl: "https://rogo.ai/careers" },
  { id: "s2", companyId: "c1", source: "LinkedIn", timestamp: "2025-01-27T14:00:00Z", summary: "VP Engineering updated profile", externalUrl: "https://linkedin.com/in/vpeng" },
  { id: "s3", companyId: "c1", source: "News", timestamp: "2025-01-26T08:00:00Z", summary: "TechCrunch: Product launch delay mentioned", externalUrl: "https://techcrunch.com/article" },
  { id: "s4", companyId: "c2", source: "Blog", timestamp: "2025-01-20T12:00:00Z", summary: "Last blog post was early January", externalUrl: "https://acme.com/blog" },
  { id: "s5", companyId: "c3", source: "Blog", timestamp: "2025-01-29T09:00:00Z", summary: "New blog post on product vision", externalUrl: "https://techstart.io/blog" },
  { id: "s6", companyId: "c3", source: "Careers", timestamp: "2025-01-29T09:00:00Z", summary: "Two new roles: Backend Engineer, Frontend Engineer", externalUrl: "https://techstart.io/careers" },
  { id: "s7", companyId: "c4", source: "News", timestamp: "2025-01-25T16:00:00Z", summary: "Negative coverage on enterprise segment", externalUrl: "https://news.com/article" },
  { id: "s8", companyId: "c4", source: "LinkedIn", timestamp: "2025-01-24T10:00:00Z", summary: "Head of Sales role reposted", externalUrl: "https://linkedin.com/jobs" },
  { id: "s9", companyId: "c5", source: "News", timestamp: "2025-01-26T08:00:00Z", summary: "Series B announced", externalUrl: "https://techcrunch.com/seriesb" },
  { id: "s10", companyId: "c5", source: "Careers", timestamp: "2025-01-26T09:00:00Z", summary: "Head of Sales and Enterprise AE roles posted", externalUrl: "https://scaleup.ai/careers" },
  { id: "s11", companyId: "c7", source: "News", timestamp: "2025-01-28T13:00:00Z", summary: "New CTO announced: Sam Chen", externalUrl: "https://techcrunch.com/cto" },
  { id: "s12", companyId: "c7", source: "Careers", timestamp: "2025-01-28T14:00:00Z", summary: "Three new roles: Staff Engineer, AE, Solutions Architect", externalUrl: "https://dataflow.io/careers" },
  { id: "s13", companyId: "c7", source: "News", timestamp: "2025-01-28T13:00:00Z", summary: "New CTO announced: Sam Chen", externalUrl: "https://techcrunch.com/cto" },
  { id: "s14", companyId: "c7", source: "Careers", timestamp: "2025-01-28T14:00:00Z", summary: "Three new roles: Staff Engineer, AE, Solutions Architect", externalUrl: "https://dataflow.io/careers" },
];

const roles: Role[] = [
  { id: "r1", companyId: "c3", title: "Backend Engineer", roleType: "Engineering", source: "Careers", firstSeen: "2025-01-29T09:00:00Z", status: "new", highPriority: false },
  { id: "r2", companyId: "c3", title: "Frontend Engineer", roleType: "Engineering", source: "Careers", firstSeen: "2025-01-29T09:00:00Z", status: "new", highPriority: false },
  { id: "r3", companyId: "c5", title: "Head of Sales", roleType: "GTM", source: "Careers", firstSeen: "2025-01-26T09:00:00Z", status: "new", highPriority: true },
  { id: "r4", companyId: "c5", title: "Enterprise AE", roleType: "GTM", source: "Careers", firstSeen: "2025-01-26T09:00:00Z", status: "new", highPriority: false },
  { id: "r5", companyId: "c7", title: "Staff Engineer", roleType: "Engineering", source: "Careers", firstSeen: "2025-01-28T14:00:00Z", status: "new", highPriority: false },
  { id: "r6", companyId: "c7", title: "AE", roleType: "GTM", source: "Careers", firstSeen: "2025-01-28T14:00:00Z", status: "new", highPriority: false },
  { id: "r7", companyId: "c7", title: "Solutions Architect", roleType: "Engineering", source: "Careers", firstSeen: "2025-01-28T14:00:00Z", status: "new", highPriority: false },
];

const peopleChanges: PersonChange[] = [
  { id: "p1", companyId: "c1", name: "VP Engineering", role: "VP Engineering", changeType: "left", sourceUrl: "https://linkedin.com/in/vpeng" },
];

const alerts: Alert[] = [
  { id: "a1", companyId: "c1", type: "hiring_pause", whyItMatters: "Two key roles removed in one week often signals budget or strategy shift.", createdAt: "2025-01-28T12:00:00Z" },
  { id: "a2", companyId: "c1", type: "exec_departure", whyItMatters: "VP Engineering departure with no announced successor may impact delivery.", createdAt: "2025-01-27T15:00:00Z" },
  { id: "a3", companyId: "c2", type: "no_activity", whyItMatters: "No public activity for 3 weeks can indicate focus shift or quiet trouble.", createdAt: "2025-01-27T00:00:00Z" },
  { id: "a4", companyId: "c4", type: "negative_press", whyItMatters: "Negative press may affect customer and partner perception.", createdAt: "2025-01-25T17:00:00Z" },
  { id: "a5", companyId: "c4", type: "role_churn", whyItMatters: "Head of Sales role removed then reposted suggests hiring difficulty.", createdAt: "2025-01-24T00:00:00Z" },
  { id: "a6", companyId: "c6", type: "no_activity", whyItMatters: "No public activity for 6 weeks; worth a check-in.", createdAt: "2025-01-22T00:00:00Z" },
];

const briefs: CompanyBrief[] = [
  {
    id: "brief-c1-1",
    companyId: "c1",
    createdAt: new Date().toISOString(),
    whatChanged: ["Two roles removed from careers page (Senior Engineer, Product Manager).", "VP Engineering departed; LinkedIn profile updated.", "TechCrunch mentioned product launch delay."],
    whyItMatters: ["Role removal often precedes or follows restructure.", "Exec departure without successor can slow roadmap.", "Public delay may affect customer confidence."],
    risksToWatch: ["Further role cuts or leadership changes.", "Silence on new hire for VP Eng."],
    whereYouCanHelp: ["Offer to intro interim or full-time VP Eng candidates.", "Check in on runway and plan."],
    questionsForCall: ["What's the timeline for backfilling VP Eng?", "Any other role or org changes planned?"],
    signalIdsBySection: { whatChanged: [["s1"], ["s2"], ["s3"]], whyItMatters: [["s1"], ["s2"], ["s3"]] },
  },
  {
    id: "brief-c2-1",
    companyId: "c2",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: ["Careers page unchanged; engineering roles were removed over two weeks ago.", "Last blog post was early January."],
    whyItMatters: ["Hiring pause can mean reprioritization or cost pressure.", "Long quiet period may mean all-hands on product or internal focus."],
    risksToWatch: ["Extended silence on hiring or product.", "Leadership or strategy change with no announcement."],
    whereYouCanHelp: ["Offer to help with candidate pipeline when they're ready.", "Light-touch check-in on priorities."],
    questionsForCall: ["Is the hiring pause intentional? Until when?", "What's the main focus for the next 30 days?"],
  },
  {
    id: "brief-c3-1",
    companyId: "c3",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: ["New blog post on product vision.", "Two new engineering roles posted (Backend, Frontend)."],
    whyItMatters: ["Continued hiring and content signal momentum.", "Good moment to offer intro to engineers if you have them."],
    risksToWatch: ["None significant this week."],
    whereYouCanHelp: ["Share strong Backend or Frontend candidates.", "Amplify the new post if relevant to your network."],
    questionsForCall: ["How's the pipeline for the new roles?", "Anything else where the board can help?"],
    signalIdsBySection: { whatChanged: [["s6"], ["s7"]] },
  },
  {
    id: "brief-c4-1",
    companyId: "c4",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: ["Negative coverage on enterprise segment.", "Head of Sales role reposted on LinkedIn after being removed."],
    whyItMatters: ["Press can affect deal flow; worth monitoring.", "Role churn on critical hire suggests difficulty filling."],
    risksToWatch: ["More negative press or competitor narrative.", "Extended time to fill Head of Sales."],
    whereYouCanHelp: ["Intro Head of Sales candidates.", "Offer to support narrative or references if helpful."],
    questionsForCall: ["How are enterprise deals trending?", "What's the plan to close the Head of Sales search?"],
  },
  {
    id: "brief-c5-1",
    companyId: "c5",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: ["Series B announced.", "Head of Sales and Enterprise AE roles posted."],
    whyItMatters: ["New capital and hiring signal growth mode.", "Strong moment to help with GTM hiring."],
    risksToWatch: ["None significant this week."],
    whereYouCanHelp: ["Intro Head of Sales and AE candidates.", "Offer customer or partner intros if relevant."],
    questionsForCall: ["How will the new capital change hiring plans?", "Priority roles beyond Head of Sales?"],
  },
  {
    id: "brief-c6-1",
    companyId: "c6",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: ["No new signals; last activity was over 6 weeks ago."],
    whyItMatters: ["Extended quiet can mean stealth mode or trouble; hard to tell from outside."],
    risksToWatch: ["Continued absence of public activity.", "Leadership or strategy change without announcement."],
    whereYouCanHelp: ["Reach out for a quick sync.", "Offer help if they're in a quiet phase."],
    questionsForCall: ["What's been the focus the last few weeks?", "Anything the board should know?"],
  },
  {
    id: "brief-c7-1",
    companyId: "c7",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: ["New CTO announced (Sam Chen).", "Three new roles: Staff Engineer, AE, Solutions Architect."],
    whyItMatters: ["Leadership hire and hiring expansion signal confidence.", "Good time to offer engineering and GTM intros."],
    risksToWatch: ["None significant this week."],
    whereYouCanHelp: ["Intro strong candidates for Staff Engineer or AE.", "Support CTO onboarding if relevant."],
    questionsForCall: ["How's the CTO ramp going?", "Which role is highest priority to fill?"],
    signalIdsBySection: { whatChanged: [["s13"], ["s14"]] },
  },
  {
    id: "brief-c8-1",
    companyId: "c8",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: ["Head of Sales role has been open 60+ days.", "No other new signals this week."],
    whyItMatters: ["Long-open critical role can indicate market or comp fit issues.", "Worth checking if they need help with the search."],
    risksToWatch: ["Role stays open with no new outreach.", "Quiet on other GTM hires."],
    whereYouCanHelp: ["Intro Head of Sales candidates.", "Offer to brainstorm search strategy."],
    questionsForCall: ["What's blocking the Head of Sales hire?", "Would a fractional or interim help?"],
  },
];

export function getFunds(): Fund[] {
  return funds;
}

export function getFund(id: string): Fund | undefined {
  return funds.find((f) => f.id === id);
}

export function getCompanies(fundId?: string): Company[] {
  if (!fundId) return companies;
  return companies.filter((c) => c.fundId === fundId);
}

export function getCompany(id: string): Company | undefined {
  return companies.find((c) => c.id === id);
}

export function getSignals(companyId: string): Signal[] {
  return signals
    .filter((s) => s.companyId === companyId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getRoles(companyId: string): Role[] {
  return roles.filter((r) => r.companyId === companyId);
}

export function getPeopleChanges(companyId: string): PersonChange[] {
  return peopleChanges.filter((p) => p.companyId === companyId);
}

export function getAlerts(fundId?: string): Alert[] {
  const fundCompanyIds = fundId ? getCompanies(fundId).map((c) => c.id) : companies.map((c) => c.id);
  return alerts
    .filter((a) => fundCompanyIds.includes(a.companyId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getOpenRolesForFund(fundId: string): (Role & { company: Company })[] {
  const openRoles = roles.filter((r) => r.status === "new" || r.status === "ongoing");
  const fundCompanies = getCompanies(fundId);
  return openRoles
    .filter((r) => fundCompanies.some((c) => c.id === r.companyId))
    .map((r) => ({ ...r, company: getCompany(r.companyId)! }))
    .filter((r) => r.company);
}

export function getBrief(companyId: string, briefId?: string): CompanyBrief | undefined {
  if (briefId) {
    return briefs.find((b) => b.id === briefId && b.companyId === companyId);
  }
  // Return latest brief for company
  const companyBriefs = briefs.filter((b) => b.companyId === companyId);
  return companyBriefs.length > 0 ? companyBriefs[0] : undefined;
}

export function getAllBriefs(companyId: string): CompanyBrief[] {
  return briefs.filter((b) => b.companyId === companyId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getAttentionCompanies(fundId: string): Company[] {
  const fundCompanies = getCompanies(fundId);
  const companyIdsWithAlerts = new Set(alerts.map((a) => a.companyId));
  return fundCompanies.filter((c) => companyIdsWithAlerts.has(c.id) || c.health !== "green");
}

export function getTasks(fundId?: string, status?: Task["status"]): Task[] {
  const fundCompanyIds = fundId ? getCompanies(fundId).map((c) => c.id) : companies.map((c) => c.id);
  let result = tasks.filter((t) => fundCompanyIds.includes(t.companyId));
  if (status) {
    result = result.filter((t) => t.status === status);
  }
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getTasksForCompany(companyId: string): Task[] {
  return tasks.filter((t) => t.companyId === companyId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

const tasks: Task[] = [
  { id: "t1", companyId: "c1", type: "action", text: "Intro VP Eng candidates", status: "pending", createdAt: "2025-01-28T12:00:00Z", section: "whereYouCanHelp" },
  { id: "t2", companyId: "c1", type: "question", text: "What's the timeline for backfilling VP Eng?", status: "pending", createdAt: "2025-01-28T12:00:00Z", section: "questionsForCall" },
];

export function getTrackedUrls(companyId: string): Array<{ id: string; url: string; label: string; urlType: string; enabled: boolean }> {
  return [
    { id: "url1", url: "https://rogo.ai/careers", label: "Careers", urlType: "static", enabled: true },
    { id: "url2", url: "https://rogo.ai/blog", label: "Blog", urlType: "static", enabled: true },
  ].filter((u) => u.url.includes(companyId) || companyId === "c1");
}

export function getSignalCache(companyId: string): { companyId: string; lastChecked: string; signalsGenerated: number; urlsChecked: number } | null {
  return {
    companyId,
    lastChecked: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    signalsGenerated: 3,
    urlsChecked: 2,
  };
}

export function getWeeklyMotion(fundId: string): Company[] {
  return getAttentionCompanies(fundId);
}

export function getSignalTexts(companyId: string | null): SignalText[] {
  if (!companyId) return [];
  const now = new Date().toISOString();
  return [
    { id: "st1", companyId, text: "Company recently raised funding", type: "custom", format: "text", category: "Funding", iconName: "DollarSign", createdAt: now, updatedAt: now },
    { id: "st2", companyId, text: "New executive hires detected", type: "custom", format: "text", category: "Leadership", iconName: "UserPlus", createdAt: now, updatedAt: now },
  ];
}

export function getStandardSignalTexts(): SignalText[] {
  const now = new Date().toISOString();
  return [
    { id: "st-standard-1", companyId: null, text: "Hiring activity increased significantly", type: "standard", format: "text", category: "Hiring", iconName: "TrendingUp", createdAt: now, updatedAt: now },
    { id: "st-standard-2", companyId: null, text: "Product launch or major update announcement", type: "standard", format: "text", category: "Product", iconName: "Rocket", createdAt: now, updatedAt: now },
  ];
}
