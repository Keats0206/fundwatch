/**
 * Mock data for development/testing when Supabase is not configured.
 */
import type { Fund, Company, Signal, Role, PersonChange, Alert, CompanyBrief, Task, SignalText } from "./types";

const funds: Fund[] = [
  { id: "y-combinator", name: "Y Combinator" },
  { id: "thrive", name: "Thrive" },
  { id: "usv", name: "USV" },
  { id: "demo", name: "Y Combinator" },
];

const companies: Company[] = [
  { id: "c1", fundId: "y-combinator", name: "Airbnb", domain: "airbnb.com", health: "green", lastUpdated: "2025-01-30T10:00:00Z", highlightChips: ["Public", "Hiring"] },
  { id: "c2", fundId: "y-combinator", name: "Coinbase", domain: "coinbase.com", health: "green", lastUpdated: "2025-01-29T14:00:00Z", highlightChips: ["Public", "Hiring"] },
  { id: "c3", fundId: "y-combinator", name: "Stripe", domain: "stripe.com", health: "green", lastUpdated: "2025-01-31T09:00:00Z", highlightChips: ["Series H", "Hiring"] },
  { id: "c4", fundId: "y-combinator", name: "Dropbox", domain: "dropbox.com", health: "yellow", lastUpdated: "2025-01-25T16:00:00Z", attentionReason: "Product pivot signals", highlightChips: ["Public"] },
  { id: "c5", fundId: "y-combinator", name: "Reddit", domain: "reddit.com", health: "green", lastUpdated: "2025-01-28T11:00:00Z", highlightChips: ["Public", "Hiring"] },
  { id: "c6", fundId: "y-combinator", name: "DoorDash", domain: "doordash.com", health: "green", lastUpdated: "2025-01-30T08:00:00Z", highlightChips: ["Public", "Hiring"] },
  { id: "c7", fundId: "y-combinator", name: "Twitch", domain: "twitch.tv", health: "yellow", lastUpdated: "2025-01-24T13:00:00Z", attentionReason: "Leadership changes", highlightChips: ["Acquired"] },
  { id: "c8", fundId: "y-combinator", name: "Gusto", domain: "gusto.com", health: "green", lastUpdated: "2025-01-29T15:00:00Z", highlightChips: ["Series E", "Hiring"] },
  { id: "c9", fundId: "y-combinator", name: "Instacart", domain: "instacart.com", health: "green", lastUpdated: "2025-01-31T10:00:00Z", highlightChips: ["Public", "Hiring"] },
  { id: "c10", fundId: "y-combinator", name: "Ramp", domain: "ramp.com", health: "green", lastUpdated: "2025-01-30T12:00:00Z", highlightChips: ["Series C", "Hiring"] },
  { id: "c11", fundId: "y-combinator", name: "Brex", domain: "brex.com", health: "yellow", lastUpdated: "2025-01-23T10:00:00Z", attentionReason: "Strategic shift in focus", highlightChips: ["Series D"] },
  { id: "c12", fundId: "y-combinator", name: "OpenAI", domain: "openai.com", health: "green", lastUpdated: "2025-01-31T14:00:00Z", highlightChips: ["Series", "Hiring"] },
  // Demo companies (matching demo_seed.sql IDs)
  { id: "airbnb", fundId: "demo", name: "Airbnb", domain: "airbnb.com", health: "green", lastUpdated: "2025-02-05T10:00:00Z", highlightChips: ["Public", "Hiring"] },
  { id: "coinbase", fundId: "demo", name: "Coinbase", domain: "coinbase.com", health: "green", lastUpdated: "2025-02-04T14:00:00Z", highlightChips: ["Public", "Hiring"] },
  { id: "stripe", fundId: "demo", name: "Stripe", domain: "stripe.com", health: "green", lastUpdated: "2025-02-06T09:00:00Z", highlightChips: ["Series H", "Hiring"] },
  { id: "dropbox", fundId: "demo", name: "Dropbox", domain: "dropbox.com", health: "yellow", lastUpdated: "2025-01-31T16:00:00Z", attentionReason: "Product pivot signals", highlightChips: ["Public"] },
  { id: "reddit", fundId: "demo", name: "Reddit", domain: "reddit.com", health: "green", lastUpdated: "2025-02-03T11:00:00Z", highlightChips: ["Public", "Hiring"] },
  { id: "doordash", fundId: "demo", name: "DoorDash", domain: "doordash.com", health: "green", lastUpdated: "2025-02-05T08:00:00Z", highlightChips: ["Public", "Hiring"] },
  { id: "twitch", fundId: "demo", name: "Twitch", domain: "twitch.tv", health: "yellow", lastUpdated: "2025-01-30T13:00:00Z", attentionReason: "Leadership changes", highlightChips: ["Acquired"] },
  { id: "gusto", fundId: "demo", name: "Gusto", domain: "gusto.com", health: "green", lastUpdated: "2025-02-04T15:00:00Z", highlightChips: ["Series E", "Hiring"] },
  { id: "instacart", fundId: "demo", name: "Instacart", domain: "instacart.com", health: "green", lastUpdated: "2025-02-06T10:00:00Z", highlightChips: ["Public", "Hiring"] },
  { id: "ramp", fundId: "demo", name: "Ramp", domain: "ramp.com", health: "green", lastUpdated: "2025-02-05T12:00:00Z", highlightChips: ["Series C", "Hiring"] },
  { id: "brex", fundId: "demo", name: "Brex", domain: "brex.com", health: "yellow", lastUpdated: "2025-01-29T10:00:00Z", attentionReason: "Strategic shift in focus", highlightChips: ["Series D"] },
  { id: "openai", fundId: "demo", name: "OpenAI", domain: "openai.com", health: "green", lastUpdated: "2025-02-06T14:00:00Z", highlightChips: ["Series", "Hiring"] },
];

const signals: Signal[] = [
  // Airbnb (c1)
  { id: "s1", companyId: "c1", source: "News", timestamp: "2025-01-30T08:00:00Z", summary: "TechCrunch: Airbnb expands into long-term stays with new features", externalUrl: "https://techcrunch.com/airbnb-longterm" },
  { id: "s2", companyId: "c1", source: "Careers", timestamp: "2025-01-30T10:00:00Z", summary: "Multiple engineering roles posted: ML Engineer, Mobile Engineer, Backend Engineer", externalUrl: "https://airbnb.com/careers" },
  // Coinbase (c2)
  { id: "s3", companyId: "c2", source: "News", timestamp: "2025-01-29T12:00:00Z", summary: "Coinbase announces new institutional products", externalUrl: "https://techcrunch.com/coinbase-institutional" },
  { id: "s4", companyId: "c2", source: "Careers", timestamp: "2025-01-29T14:00:00Z", summary: "Hiring for compliance and security roles", externalUrl: "https://coinbase.com/careers" },
  // Stripe (c3)
  { id: "s5", companyId: "c3", source: "Blog", timestamp: "2025-01-31T09:00:00Z", summary: "Stripe blog: New payment features for global expansion", externalUrl: "https://stripe.com/blog/new-features" },
  { id: "s6", companyId: "c3", source: "Careers", timestamp: "2025-01-31T10:00:00Z", summary: "Expanding engineering team: Backend, Frontend, Infrastructure roles", externalUrl: "https://stripe.com/jobs" },
  // Dropbox (c4)
  { id: "s7", companyId: "c4", source: "News", timestamp: "2025-01-25T14:00:00Z", summary: "Dropbox pivots focus to AI-powered collaboration tools", externalUrl: "https://techcrunch.com/dropbox-ai-pivot" },
  { id: "s8", companyId: "c4", source: "LinkedIn", timestamp: "2025-01-24T10:00:00Z", summary: "Product leadership changes announced", externalUrl: "https://linkedin.com/posts/dropbox" },
  // Reddit (c5)
  { id: "s9", companyId: "c5", source: "News", timestamp: "2025-01-28T09:00:00Z", summary: "Reddit IPO performance update", externalUrl: "https://techcrunch.com/reddit-ipo" },
  { id: "s10", companyId: "c5", source: "Careers", timestamp: "2025-01-28T11:00:00Z", summary: "Hiring for data science and ML roles", externalUrl: "https://reddit.com/careers" },
  // DoorDash (c6)
  { id: "s11", companyId: "c6", source: "News", timestamp: "2025-01-30T07:00:00Z", summary: "DoorDash expands grocery delivery partnerships", externalUrl: "https://techcrunch.com/doordash-grocery" },
  { id: "s12", companyId: "c6", source: "Careers", timestamp: "2025-01-30T08:00:00Z", summary: "Operations and logistics roles posted", externalUrl: "https://doordash.com/careers" },
  // Twitch (c7)
  { id: "s13", companyId: "c7", source: "LinkedIn", timestamp: "2025-01-24T13:00:00Z", summary: "New VP of Content announced", externalUrl: "https://linkedin.com/posts/twitch" },
  { id: "s14", companyId: "c7", source: "News", timestamp: "2025-01-23T10:00:00Z", summary: "Twitch announces creator monetization changes", externalUrl: "https://techcrunch.com/twitch-monetization" },
  // Gusto (c8)
  { id: "s15", companyId: "c8", source: "Blog", timestamp: "2025-01-29T11:00:00Z", summary: "Gusto blog: New HR features for SMBs", externalUrl: "https://gusto.com/blog/new-features" },
  { id: "s16", companyId: "c8", source: "Careers", timestamp: "2025-01-29T15:00:00Z", summary: "Sales and customer success roles posted", externalUrl: "https://gusto.com/careers" },
  // Instacart (c9)
  { id: "s17", companyId: "c9", source: "News", timestamp: "2025-01-31T09:00:00Z", summary: "Instacart partners with major retailers for same-day delivery", externalUrl: "https://techcrunch.com/instacart-partnerships" },
  { id: "s18", companyId: "c9", source: "Careers", timestamp: "2025-01-31T10:00:00Z", summary: "Engineering and operations roles posted", externalUrl: "https://instacart.com/careers" },
  // Ramp (c10)
  { id: "s19", companyId: "c10", source: "News", timestamp: "2025-01-30T11:00:00Z", summary: "Ramp raises Series C: $300M at $8B valuation", externalUrl: "https://techcrunch.com/ramp-seriesc" },
  { id: "s20", companyId: "c10", source: "Careers", timestamp: "2025-01-30T12:00:00Z", summary: "Aggressive hiring: Engineering, Sales, Product roles", externalUrl: "https://ramp.com/careers" },
  // Brex (c11)
  { id: "s21", companyId: "c11", source: "LinkedIn", timestamp: "2025-01-23T10:00:00Z", summary: "Strategic shift: Focusing on enterprise customers", externalUrl: "https://linkedin.com/posts/brex" },
  { id: "s22", companyId: "c11", source: "News", timestamp: "2025-01-22T09:00:00Z", summary: "Brex announces pivot away from SMB segment", externalUrl: "https://techcrunch.com/brex-pivot" },
  // OpenAI (c12)
  { id: "s23", companyId: "c12", source: "News", timestamp: "2025-01-31T13:00:00Z", summary: "OpenAI announces GPT-5 and new enterprise features", externalUrl: "https://techcrunch.com/openai-gpt5" },
  { id: "s24", companyId: "c12", source: "Careers", timestamp: "2025-01-31T14:00:00Z", summary: "Massive hiring push: Research, Engineering, Safety roles", externalUrl: "https://openai.com/careers" },
  // Demo company signals
  { id: "s-demo-airbnb-1", companyId: "airbnb", source: "News", timestamp: "2025-02-05T08:00:00Z", summary: "TechCrunch: Airbnb expands into long-term stays with new features", externalUrl: "https://techcrunch.com/airbnb-longterm" },
  { id: "s-demo-airbnb-2", companyId: "airbnb", source: "Careers", timestamp: "2025-02-05T10:00:00Z", summary: "Multiple engineering roles posted: ML Engineer, Mobile Engineer, Backend Engineer", externalUrl: "https://airbnb.com/careers" },
  { id: "s-demo-stripe-1", companyId: "stripe", source: "Blog", timestamp: "2025-02-06T09:00:00Z", summary: "Stripe blog: New payment features for global expansion", externalUrl: "https://stripe.com/blog/new-features" },
  { id: "s-demo-stripe-2", companyId: "stripe", source: "Careers", timestamp: "2025-02-06T10:00:00Z", summary: "Expanding engineering team: Backend, Frontend, Infrastructure roles", externalUrl: "https://stripe.com/jobs" },
  { id: "s-demo-openai-1", companyId: "openai", source: "News", timestamp: "2025-02-06T13:00:00Z", summary: "OpenAI announces GPT-5 and new enterprise features", externalUrl: "https://techcrunch.com/openai-gpt5" },
  { id: "s-demo-openai-2", companyId: "openai", source: "Careers", timestamp: "2025-02-06T14:00:00Z", summary: "Massive hiring push: Research, Engineering, Safety roles", externalUrl: "https://openai.com/careers" },
  // Coinbase
  { id: "s-demo-coinbase-1", companyId: "coinbase", source: "News", timestamp: "2025-02-04T12:00:00Z", summary: "Coinbase announces new institutional products", externalUrl: "https://techcrunch.com/coinbase-institutional" },
  { id: "s-demo-coinbase-2", companyId: "coinbase", source: "Careers", timestamp: "2025-02-04T14:00:00Z", summary: "Hiring for compliance and security roles", externalUrl: "https://coinbase.com/careers" },
  // Dropbox
  { id: "s-demo-dropbox-1", companyId: "dropbox", source: "News", timestamp: "2025-01-31T14:00:00Z", summary: "Dropbox pivots focus to AI-powered collaboration tools", externalUrl: "https://techcrunch.com/dropbox-ai-pivot" },
  { id: "s-demo-dropbox-2", companyId: "dropbox", source: "LinkedIn", timestamp: "2025-01-30T10:00:00Z", summary: "Product leadership changes announced", externalUrl: "https://linkedin.com/posts/dropbox" },
  // Reddit
  { id: "s-demo-reddit-1", companyId: "reddit", source: "News", timestamp: "2025-02-03T09:00:00Z", summary: "Reddit IPO performance update", externalUrl: "https://techcrunch.com/reddit-ipo" },
  { id: "s-demo-reddit-2", companyId: "reddit", source: "Careers", timestamp: "2025-02-03T11:00:00Z", summary: "Hiring for data science and ML roles", externalUrl: "https://reddit.com/careers" },
  // DoorDash
  { id: "s-demo-doordash-1", companyId: "doordash", source: "News", timestamp: "2025-02-05T07:00:00Z", summary: "DoorDash expands grocery delivery partnerships", externalUrl: "https://techcrunch.com/doordash-grocery" },
  { id: "s-demo-doordash-2", companyId: "doordash", source: "Careers", timestamp: "2025-02-05T08:00:00Z", summary: "Operations and logistics roles posted", externalUrl: "https://doordash.com/careers" },
  // Twitch
  { id: "s-demo-twitch-1", companyId: "twitch", source: "LinkedIn", timestamp: "2025-01-30T13:00:00Z", summary: "New VP of Content announced", externalUrl: "https://linkedin.com/posts/twitch" },
  { id: "s-demo-twitch-2", companyId: "twitch", source: "News", timestamp: "2025-01-29T10:00:00Z", summary: "Twitch announces creator monetization changes", externalUrl: "https://techcrunch.com/twitch-monetization" },
  // Gusto
  { id: "s-demo-gusto-1", companyId: "gusto", source: "Blog", timestamp: "2025-02-04T11:00:00Z", summary: "Gusto blog: New HR features for SMBs", externalUrl: "https://gusto.com/blog/new-features" },
  { id: "s-demo-gusto-2", companyId: "gusto", source: "Careers", timestamp: "2025-02-04T15:00:00Z", summary: "Sales and customer success roles posted", externalUrl: "https://gusto.com/careers" },
  // Instacart
  { id: "s-demo-instacart-1", companyId: "instacart", source: "News", timestamp: "2025-02-06T09:00:00Z", summary: "Instacart partners with major retailers for same-day delivery", externalUrl: "https://techcrunch.com/instacart-partnerships" },
  { id: "s-demo-instacart-2", companyId: "instacart", source: "Careers", timestamp: "2025-02-06T10:00:00Z", summary: "Engineering and operations roles posted", externalUrl: "https://instacart.com/careers" },
  // Ramp
  { id: "s-demo-ramp-1", companyId: "ramp", source: "News", timestamp: "2025-02-05T11:00:00Z", summary: "Ramp raises Series C: $300M at $8B valuation", externalUrl: "https://techcrunch.com/ramp-seriesc" },
  { id: "s-demo-ramp-2", companyId: "ramp", source: "Careers", timestamp: "2025-02-05T12:00:00Z", summary: "Aggressive hiring: Engineering, Sales, Product roles", externalUrl: "https://ramp.com/careers" },
  // Brex
  { id: "s-demo-brex-1", companyId: "brex", source: "LinkedIn", timestamp: "2025-01-29T10:00:00Z", summary: "Strategic shift: Focusing on enterprise customers", externalUrl: "https://linkedin.com/posts/brex" },
  { id: "s-demo-brex-2", companyId: "brex", source: "News", timestamp: "2025-01-28T09:00:00Z", summary: "Brex announces pivot away from SMB segment", externalUrl: "https://techcrunch.com/brex-pivot" },
];

const roles: Role[] = [
  { id: "r1", companyId: "c1", title: "Senior Software Engineer", roleType: "Engineering", source: "Careers", firstSeen: "2025-01-30T10:00:00Z", status: "new", highPriority: false },
  { id: "r2", companyId: "c1", title: "Product Manager", roleType: "Leadership", source: "Careers", firstSeen: "2025-01-30T10:00:00Z", status: "new", highPriority: false },
  { id: "r3", companyId: "c2", title: "Backend Engineer", roleType: "Engineering", source: "Careers", firstSeen: "2025-01-28T12:00:00Z", status: "new", highPriority: false },
  { id: "r4", companyId: "c3", title: "Engineering Manager", roleType: "Engineering", source: "Careers", firstSeen: "2025-01-30T10:00:00Z", status: "new", highPriority: false },
  { id: "r5", companyId: "c5", title: "Content Moderator", roleType: "Other", source: "Careers", firstSeen: "2025-01-27T09:00:00Z", status: "new", highPriority: false },
  { id: "r6", companyId: "c6", title: "Operations Manager", roleType: "Other", source: "Careers", firstSeen: "2025-01-29T14:00:00Z", status: "new", highPriority: false },
  { id: "r7", companyId: "c8", title: "Senior Engineer", roleType: "Engineering", source: "Careers", firstSeen: "2025-01-29T09:00:00Z", status: "new", highPriority: false },
  { id: "r8", companyId: "c8", title: "VP Sales", roleType: "GTM", source: "Careers", firstSeen: "2025-01-29T09:00:00Z", status: "new", highPriority: true },
  { id: "r9", companyId: "c10", title: "Enterprise AE", roleType: "GTM", source: "Careers", firstSeen: "2025-01-29T15:00:00Z", status: "new", highPriority: false },
  { id: "r10", companyId: "c12", title: "Research Scientist", roleType: "Engineering", source: "Careers", firstSeen: "2025-01-31T15:00:00Z", status: "new", highPriority: true },
  { id: "r11", companyId: "c12", title: "Safety Engineer", roleType: "Engineering", source: "Careers", firstSeen: "2025-01-31T15:00:00Z", status: "new", highPriority: true },
];

const peopleChanges: PersonChange[] = [
  { id: "p1", companyId: "c7", name: "Head of Creator Partnerships", role: "Head of Creator Partnerships", changeType: "left", sourceUrl: "https://linkedin.com/in/creatorhead" },
  { id: "p2", companyId: "c8", name: "VP Product", role: "VP Product", changeType: "joined", sourceUrl: "https://linkedin.com/in/vpproduct" },
];

const alerts: Alert[] = [
  { id: "a1", companyId: "c4", type: "role_churn", whyItMatters: "Product pivot signals may indicate strategic shift or market challenges.", createdAt: "2025-01-25T16:00:00Z" },
  { id: "a2", companyId: "c7", type: "exec_departure", whyItMatters: "Leadership changes under parent company may signal strategic shifts.", createdAt: "2025-01-24T13:00:00Z" },
  { id: "a3", companyId: "c11", type: "role_churn", whyItMatters: "Strategic shift in focus from SMB to enterprise may impact existing customers.", createdAt: "2025-01-23T11:00:00Z" },
];

const briefs: CompanyBrief[] = [
  {
    id: "brief-c1-1",
    companyId: "c1",
    createdAt: new Date().toISOString(),
    whatChanged: ["TechCrunch: Airbnb expands into long-term stays with new features.", "Multiple engineering roles posted: ML Engineer, Mobile Engineer, Backend Engineer."],
    whyItMatters: ["Product expansion signals growth strategy and market opportunity.", "Aggressive engineering hiring indicates strong product roadmap execution."],
    risksToWatch: ["None significant this week."],
    whereYouCanHelp: ["Intro strong ML or mobile engineering candidates.", "Share insights on long-term stay market dynamics."],
    questionsForCall: ["How's the early traction on long-term stays?", "What's driving the ML engineering expansion?"],
    signalIdsBySection: { whatChanged: [["s1"], ["s2"]] },
  },
  {
    id: "brief-c2-1",
    companyId: "c2",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: ["Coinbase announces new institutional products.", "Hiring for compliance and security roles."],
    whyItMatters: ["Institutional focus signals strategic shift toward higher-value customers.", "Compliance hiring indicates regulatory readiness and market expansion."],
    risksToWatch: ["None significant this week."],
    whereYouCanHelp: ["Intro institutional customers or partners.", "Share compliance/security talent if relevant."],
    questionsForCall: ["How's the institutional product pipeline?", "What markets are you targeting next?"],
    signalIdsBySection: { whatChanged: [["s3"], ["s4"]] },
  },
  {
    id: "brief-c3-1",
    companyId: "c3",
    createdAt: new Date().toISOString(),
    whatChanged: ["Stripe blog: New payment features for global expansion.", "Expanding engineering team: Backend, Frontend, Infrastructure roles."],
    whyItMatters: ["Global expansion signals strong international growth trajectory.", "Engineering hiring indicates continued product development momentum."],
    risksToWatch: ["None significant this week."],
    whereYouCanHelp: ["Intro engineering candidates or international partners.", "Amplify the blog post if relevant to your network."],
    questionsForCall: ["Which markets are highest priority for expansion?", "How's the engineering hiring pipeline?"],
    signalIdsBySection: { whatChanged: [["s5"], ["s6"]] },
  },
  {
    id: "brief-c4-1",
    companyId: "c4",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: ["Dropbox pivots focus to AI-powered collaboration tools.", "VP Product posted about strategic pivot on LinkedIn."],
    whyItMatters: ["AI pivot signals strategic repositioning in competitive market.", "Public pivot announcement may affect customer and partner perception."],
    risksToWatch: ["Customer confusion or churn during transition.", "Execution risk with new strategic direction."],
    whereYouCanHelp: ["Offer strategic guidance on AI positioning.", "Intro AI talent or partners if relevant."],
    questionsForCall: ["What's driving the pivot decision?", "How are existing customers responding?"],
    signalIdsBySection: { whatChanged: [["s7"], ["s8"]] },
  },
  {
    id: "brief-c5-1",
    companyId: "c5",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: ["Reddit IPO preparation continues.", "Expanding content moderation and engineering teams."],
    whyItMatters: ["IPO prep signals strong financial position and growth trajectory.", "Content moderation hiring indicates focus on platform safety and scale."],
    risksToWatch: ["None significant this week."],
    whereYouCanHelp: ["Intro content moderation or engineering candidates.", "Offer IPO preparation support if relevant."],
    questionsForCall: ["What's the IPO timeline looking like?", "How's the content moderation scaling going?"],
    signalIdsBySection: { whatChanged: [["s9"], ["s10"]] },
  },
  {
    id: "brief-c6-1",
    companyId: "c6",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: ["DoorDash expands grocery delivery to new cities.", "Hiring surge: Operations, engineering, and logistics roles."],
    whyItMatters: ["Grocery expansion signals diversification and growth opportunity.", "Operations hiring indicates scaling infrastructure for expansion."],
    risksToWatch: ["None significant this week."],
    whereYouCanHelp: ["Intro operations or logistics talent.", "Share insights on grocery delivery market dynamics."],
    questionsForCall: ["Which cities are highest priority?", "How's the grocery unit economics?"],
    signalIdsBySection: { whatChanged: [["s11"], ["s12"]] },
  },
  {
    id: "brief-c7-1",
    companyId: "c7",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: ["Twitch leadership changes under Amazon.", "Head of Creator Partnerships announced departure."],
    whyItMatters: ["Leadership changes may signal strategic shifts under parent company.", "Creator partnerships departure could impact creator relations."],
    risksToWatch: ["Further leadership changes or strategic uncertainty.", "Creator community concerns."],
    whereYouCanHelp: ["Offer strategic guidance on creator relations.", "Intro creator partnerships talent if relevant."],
    questionsForCall: ["What's driving the leadership changes?", "How are creators responding?"],
    signalIdsBySection: { whatChanged: [["s13"], ["s14"]] },
  },
  {
    id: "brief-c8-1",
    companyId: "c8",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: ["Gusto raises Series E: $200M at $10B valuation.", "Massive hiring push: 50+ roles across all departments."],
    whyItMatters: ["Series E at $10B signals strong traction and path to IPO.", "Aggressive hiring indicates confidence in growth plan."],
    risksToWatch: ["Execution risk with rapid scaling—ensure culture scales too.", "Hiring quality critical at this stage."],
    whereYouCanHelp: ["Intro strong candidates across departments.", "Offer strategic guidance on scaling operations."],
    questionsForCall: ["What's the hiring timeline and capacity?", "How are you thinking about IPO readiness?"],
    signalIdsBySection: { whatChanged: [["s15"], ["s16"]] },
  },
  {
    id: "brief-c9-1",
    companyId: "c9",
    createdAt: new Date().toISOString(),
    whatChanged: ["Instacart expands same-day delivery coverage.", "Engineering and operations roles added."],
    whyItMatters: ["Coverage expansion signals growth and market opportunity.", "Hiring indicates infrastructure scaling for expansion."],
    risksToWatch: ["None significant this week."],
    whereYouCanHelp: ["Intro engineering or operations candidates.", "Share insights on delivery market dynamics."],
    questionsForCall: ["Which markets are highest priority?", "How's the same-day delivery unit economics?"],
    signalIdsBySection: { whatChanged: [["s17"], ["s18"]] },
  },
  {
    id: "brief-c10-1",
    companyId: "c10",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: ["Ramp raises Series C: $300M at $8B valuation.", "Expanding sales and engineering teams."],
    whyItMatters: ["Series C at $8B signals strong traction and path to scale.", "GTM and engineering expansion indicates growth mode."],
    risksToWatch: ["None significant this week."],
    whereYouCanHelp: ["Intro sales or engineering candidates.", "Offer customer or partner introductions."],
    questionsForCall: ["What's the plan for deploying the new capital?", "Which roles are highest priority?"],
    signalIdsBySection: { whatChanged: [["s19"], ["s20"]] },
  },
  {
    id: "brief-c11-1",
    companyId: "c11",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: ["Brex shifts focus from SMB to enterprise.", "CEO posted about strategic repositioning on LinkedIn."],
    whyItMatters: ["Strategic shift may impact existing SMB customers.", "Enterprise focus signals higher-value market opportunity but execution risk."],
    risksToWatch: ["SMB customer churn during transition.", "Enterprise sales execution challenges."],
    whereYouCanHelp: ["Offer strategic guidance on enterprise positioning.", "Intro enterprise customers or sales talent."],
    questionsForCall: ["What's driving the strategic shift?", "How are existing SMB customers responding?"],
    signalIdsBySection: { whatChanged: [["s21"], ["s22"]] },
  },
  {
    id: "brief-c12-1",
    companyId: "c12",
    createdAt: new Date().toISOString(),
    whatChanged: ["OpenAI announces GPT-5 and new enterprise features.", "Aggressive hiring: 100+ roles in research, engineering, safety."],
    whyItMatters: ["GPT-5 announcement signals continued innovation leadership.", "Massive hiring indicates scaling for next-generation products."],
    risksToWatch: ["Execution risk with rapid scaling.", "Safety and alignment challenges with advanced models."],
    whereYouCanHelp: ["Intro research, engineering, or safety talent.", "Offer strategic guidance on enterprise positioning."],
    questionsForCall: ["What's the timeline for GPT-5?", "How are you thinking about safety at scale?"],
    signalIdsBySection: { whatChanged: [["s23"], ["s24"], ["s25"]] },
  },
  // Demo company briefs with rich partnerTake, momentumScore, etc.
  {
    id: "brief-airbnb-1",
    companyId: "airbnb",
    createdAt: new Date().toISOString(),
    whatChanged: [
      "TechCrunch: Airbnb expands into long-term stays with new features.",
      "Multiple engineering roles posted: ML Engineer, Mobile Engineer, Backend Engineer.",
    ],
    whyItMatters: [
      "Product expansion signals growth strategy and market opportunity.",
      "Aggressive engineering hiring indicates strong product roadmap execution.",
    ],
    risksToWatch: ["None significant this week."],
    whereYouCanHelp: [
      "Intro strong ML or mobile engineering candidates.",
      "Share insights on long-term stay market dynamics.",
    ],
    questionsForCall: [
      "How's the early traction on long-term stays?",
      "What's driving the ML engineering expansion?",
    ],
    signalIdsBySection: { whatChanged: [["s-demo-airbnb-1"], ["s-demo-airbnb-2"]] },
    partnerTake: {
      take: "Airbnb is executing well on product expansion and hiring—this is a strong re-engagement opportunity. The long-term stays pivot shows strategic thinking, and the ML engineering focus suggests they're building differentiated features. Reach out with relevant talent intros or market insights.",
      action: "re-engage",
      confidence: 0.75,
      rationaleBullets: [
        "Product expansion signals active growth strategy",
        "Engineering hiring indicates execution momentum",
        "Long-term stays is a high-value market segment",
      ],
    },
    confidenceModifiers: {
      increases: "If long-term stays show strong early traction or they raise another round, confidence increases significantly.",
      decreases: "If engineering roles remain unfilled for 2+ months or product expansion stalls, confidence decreases.",
    },
    momentumScore: 4.2,
    momentumStatus: "green",
  },
  {
    id: "brief-stripe-1",
    companyId: "stripe",
    createdAt: new Date().toISOString(),
    whatChanged: [
      "Stripe blog: New payment features for global expansion.",
      "Expanding engineering team: Backend, Frontend, Infrastructure roles.",
    ],
    whyItMatters: [
      "Global expansion signals strong international growth trajectory.",
      "Engineering hiring indicates continued product development momentum.",
    ],
    risksToWatch: ["None significant this week."],
    whereYouCanHelp: [
      "Intro engineering candidates or international partners.",
      "Amplify the blog post if relevant to your network.",
    ],
    questionsForCall: [
      "Which markets are highest priority for expansion?",
      "How's the engineering hiring pipeline?",
    ],
    signalIdsBySection: { whatChanged: [["s-demo-stripe-1"], ["s-demo-stripe-2"]] },
    partnerTake: {
      take: "Stripe continues to execute at a high level—global expansion and engineering hiring show they're scaling aggressively. This is a monitor situation unless you have specific value-add (talent, partnerships, or market insights).",
      action: "monitor",
      confidence: 0.5,
      rationaleBullets: [
        "Global expansion is expected for Stripe at this stage",
        "Engineering hiring is standard growth activity",
        "No specific re-engagement trigger identified",
      ],
    },
    confidenceModifiers: {
      increases: "If they announce major enterprise partnerships or new product lines, confidence increases.",
      decreases: "If engineering hiring stalls or expansion slows, confidence decreases.",
    },
    momentumScore: 3.1,
    momentumStatus: "green",
  },
  {
    id: "brief-openai-1",
    companyId: "openai",
    createdAt: new Date().toISOString(),
    whatChanged: [
      "OpenAI announces GPT-5 and new enterprise features.",
      "Massive hiring push: 100+ roles in research, engineering, safety.",
    ],
    whyItMatters: [
      "GPT-5 announcement signals continued innovation leadership.",
      "Massive hiring indicates scaling for next-generation products.",
    ],
    risksToWatch: [
      "Execution risk with rapid scaling.",
      "Safety and alignment challenges with advanced models.",
    ],
    whereYouCanHelp: [
      "Intro research, engineering, or safety talent.",
      "Offer strategic guidance on enterprise positioning.",
    ],
    questionsForCall: [
      "What's the timeline for GPT-5?",
      "How are you thinking about safety at scale?",
    ],
    signalIdsBySection: { whatChanged: [["s-demo-openai-1"], ["s-demo-openai-2"]] },
    partnerTake: {
      take: "OpenAI is in hypergrowth mode—GPT-5 announcement and massive hiring signal they're pushing hard on next-gen products. This is a strong re-engagement opportunity, especially if you can help with talent intros (research/safety are critical) or enterprise positioning.",
      action: "re-engage",
      confidence: 1.0,
      rationaleBullets: [
        "GPT-5 announcement shows continued innovation leadership",
        "Massive hiring indicates aggressive scaling plans",
        "Research and safety roles are high-value intros",
      ],
    },
    confidenceModifiers: {
      increases: "If GPT-5 launch is successful or they secure major enterprise deals, confidence increases significantly.",
      decreases: "If safety concerns escalate or hiring stalls, confidence decreases.",
    },
    momentumScore: 4.8,
    momentumStatus: "green",
  },
  {
    id: "brief-coinbase-1",
    companyId: "coinbase",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: [
      "Coinbase announces new institutional products.",
      "Hiring for compliance and security roles.",
    ],
    whyItMatters: [
      "Institutional focus signals strategic shift toward higher-value customers.",
      "Compliance hiring indicates regulatory readiness and market expansion.",
    ],
    risksToWatch: ["None significant this week."],
    whereYouCanHelp: [
      "Intro institutional customers or partners.",
      "Share compliance/security talent if relevant.",
    ],
    questionsForCall: [
      "How's the institutional product pipeline?",
      "What markets are you targeting next?",
    ],
    signalIdsBySection: { whatChanged: [["s-demo-coinbase-1"], ["s-demo-coinbase-2"]] },
    partnerTake: {
      take: "Coinbase is executing well on institutional strategy—compliance hiring shows they're serious about regulatory readiness. This is a monitor situation unless you have specific institutional connections or compliance talent to offer.",
      action: "monitor",
      confidence: 0.5,
      rationaleBullets: [
        "Institutional focus is expected strategic direction",
        "Compliance hiring shows execution on strategy",
        "No immediate re-engagement trigger",
      ],
    },
    confidenceModifiers: {
      increases: "If they secure major institutional partnerships or expand into new markets, confidence increases.",
      decreases: "If compliance hiring stalls or regulatory challenges emerge, confidence decreases.",
    },
    momentumScore: 2.8,
    momentumStatus: "green",
  },
  {
    id: "brief-dropbox-1",
    companyId: "dropbox",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: [
      "Dropbox pivots focus to AI-powered collaboration tools.",
      "Product leadership changes announced.",
    ],
    whyItMatters: [
      "AI pivot signals strategic repositioning in competitive market.",
      "Public pivot announcement may affect customer and partner perception.",
    ],
    risksToWatch: [
      "Customer confusion or churn during transition.",
      "Execution risk with new strategic direction.",
    ],
    whereYouCanHelp: [
      "Offer strategic guidance on AI positioning.",
      "Intro AI talent or partners if relevant.",
    ],
    questionsForCall: [
      "What's driving the pivot decision?",
      "How are existing customers responding?",
    ],
    signalIdsBySection: { whatChanged: [["s-demo-dropbox-1"], ["s-demo-dropbox-2"]] },
    partnerTake: {
      take: "Dropbox is pivoting to AI—this is a monitor situation with caution. Strategic pivots can be risky, especially for established companies. Watch for customer feedback and execution signals before re-engaging.",
      action: "monitor",
      confidence: 0.5,
      rationaleBullets: [
        "Strategic pivot signals market pressure",
        "Leadership changes add execution risk",
        "Customer response will determine success",
      ],
    },
    confidenceModifiers: {
      increases: "If AI products gain traction or customer feedback is positive, confidence increases.",
      decreases: "If customer churn increases or execution falters, confidence decreases significantly.",
    },
    momentumScore: 1.8,
    momentumStatus: "yellow",
  },
  {
    id: "brief-reddit-1",
    companyId: "reddit",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: [
      "Reddit IPO performance update.",
      "Expanding content moderation and engineering teams.",
    ],
    whyItMatters: [
      "IPO prep signals strong financial position and growth trajectory.",
      "Content moderation hiring indicates focus on platform safety and scale.",
    ],
    risksToWatch: ["None significant this week."],
    whereYouCanHelp: [
      "Intro content moderation or engineering candidates.",
      "Offer IPO preparation support if relevant.",
    ],
    questionsForCall: [
      "What's the IPO timeline looking like?",
      "How's the content moderation scaling going?",
    ],
    signalIdsBySection: { whatChanged: [["s-demo-reddit-1"], ["s-demo-reddit-2"]] },
    partnerTake: {
      take: "Reddit is executing well on IPO prep and platform safety—content moderation hiring shows they're taking platform health seriously. This is a monitor situation unless you have relevant talent or IPO expertise to offer.",
      action: "monitor",
      confidence: 0.5,
      rationaleBullets: [
        "IPO prep is standard for public companies",
        "Content moderation hiring shows execution",
        "No specific re-engagement trigger",
      ],
    },
    confidenceModifiers: {
      increases: "If IPO performs well or platform safety metrics improve, confidence increases.",
      decreases: "If content moderation challenges escalate or IPO underperforms, confidence decreases.",
    },
    momentumScore: 3.0,
    momentumStatus: "green",
  },
  {
    id: "brief-doordash-1",
    companyId: "doordash",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: [
      "DoorDash expands grocery delivery to new cities.",
      "Hiring surge: Operations, engineering, and logistics roles.",
    ],
    whyItMatters: [
      "Grocery expansion signals diversification and growth opportunity.",
      "Operations hiring indicates scaling infrastructure for expansion.",
    ],
    risksToWatch: ["None significant this week."],
    whereYouCanHelp: [
      "Intro operations or logistics talent.",
      "Share insights on grocery delivery market dynamics.",
    ],
    questionsForCall: [
      "Which cities are highest priority?",
      "How's the grocery unit economics?",
    ],
    signalIdsBySection: { whatChanged: [["s-demo-doordash-1"], ["s-demo-doordash-2"]] },
    partnerTake: {
      take: "DoorDash is expanding aggressively into grocery—this is a strong re-engagement opportunity. Grocery delivery is a high-value market, and operations hiring shows they're serious about execution. Reach out with relevant talent or market insights.",
      action: "re-engage",
      confidence: 0.75,
      rationaleBullets: [
        "Grocery expansion signals growth opportunity",
        "Operations hiring indicates execution focus",
        "High-value market segment",
      ],
    },
    confidenceModifiers: {
      increases: "If grocery expansion shows strong traction or unit economics improve, confidence increases significantly.",
      decreases: "If expansion stalls or operations hiring slows, confidence decreases.",
    },
    momentumScore: 4.0,
    momentumStatus: "green",
  },
  {
    id: "brief-twitch-1",
    companyId: "twitch",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: [
      "Twitch leadership changes under Amazon.",
      "New VP of Content announced.",
    ],
    whyItMatters: [
      "Leadership changes may signal strategic shifts under parent company.",
      "Creator monetization changes could impact creator relations.",
    ],
    risksToWatch: [
      "Further leadership changes or strategic uncertainty.",
      "Creator community concerns.",
    ],
    whereYouCanHelp: [
      "Offer strategic guidance on creator relations.",
      "Intro creator partnerships talent if relevant.",
    ],
    questionsForCall: [
      "What's driving the leadership changes?",
      "How are creators responding?",
    ],
    signalIdsBySection: { whatChanged: [["s-demo-twitch-1"], ["s-demo-twitch-2"]] },
    partnerTake: {
      take: "Twitch is experiencing leadership changes under Amazon—this is a monitor situation with caution. Parent company changes can signal strategic shifts. Watch for creator community response and further changes before re-engaging.",
      action: "monitor",
      confidence: 0.5,
      rationaleBullets: [
        "Leadership changes signal potential strategic shifts",
        "Creator monetization changes add risk",
        "Parent company influence adds uncertainty",
      ],
    },
    confidenceModifiers: {
      increases: "If creator community responds positively or new leadership stabilizes, confidence increases.",
      decreases: "If creator concerns escalate or further changes occur, confidence decreases significantly.",
    },
    momentumScore: 1.5,
    momentumStatus: "yellow",
  },
  {
    id: "brief-gusto-1",
    companyId: "gusto",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: [
      "Gusto blog: New HR features for SMBs.",
      "Sales and customer success roles posted.",
    ],
    whyItMatters: [
      "New features signal continued product innovation.",
      "Sales hiring indicates growth mode and market expansion.",
    ],
    risksToWatch: ["None significant this week."],
    whereYouCanHelp: [
      "Intro sales or customer success talent.",
      "Share insights on SMB HR market dynamics.",
    ],
    questionsForCall: [
      "How's the new feature adoption?",
      "What's driving the sales expansion?",
    ],
    signalIdsBySection: { whatChanged: [["s-demo-gusto-1"], ["s-demo-gusto-2"]] },
    partnerTake: {
      take: "Gusto is executing well on product and sales—new features and sales hiring show they're in growth mode. This is a monitor situation unless you have relevant sales talent or SMB market insights to offer.",
      action: "monitor",
      confidence: 0.5,
      rationaleBullets: [
        "Product innovation is standard growth activity",
        "Sales hiring indicates growth mode",
        "No specific re-engagement trigger",
      ],
    },
    confidenceModifiers: {
      increases: "If new features gain traction or sales expansion accelerates, confidence increases.",
      decreases: "If feature adoption stalls or sales hiring slows, confidence decreases.",
    },
    momentumScore: 3.2,
    momentumStatus: "green",
  },
  {
    id: "brief-instacart-1",
    companyId: "instacart",
    createdAt: new Date().toISOString(),
    whatChanged: [
      "Instacart partners with major retailers for same-day delivery.",
      "Engineering and operations roles added.",
    ],
    whyItMatters: [
      "Retailer partnerships signal strong market position.",
      "Engineering hiring indicates infrastructure scaling for expansion.",
    ],
    risksToWatch: ["None significant this week."],
    whereYouCanHelp: [
      "Intro engineering or operations candidates.",
      "Share insights on delivery market dynamics.",
    ],
    questionsForCall: [
      "Which retailers are highest priority?",
      "How's the same-day delivery unit economics?",
    ],
    signalIdsBySection: { whatChanged: [["s-demo-instacart-1"], ["s-demo-instacart-2"]] },
    partnerTake: {
      take: "Instacart is executing well on partnerships and infrastructure—retailer partnerships show strong market position, and engineering hiring indicates scaling. This is a monitor situation unless you have relevant talent or market insights.",
      action: "monitor",
      confidence: 0.5,
      rationaleBullets: [
        "Retailer partnerships signal market strength",
        "Engineering hiring indicates scaling",
        "No specific re-engagement trigger",
      ],
    },
    confidenceModifiers: {
      increases: "If partnerships expand or same-day delivery gains traction, confidence increases.",
      decreases: "If partnerships stall or engineering hiring slows, confidence decreases.",
    },
    momentumScore: 3.5,
    momentumStatus: "green",
  },
  {
    id: "brief-ramp-1",
    companyId: "ramp",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: [
      "Ramp raises Series C: $300M at $8B valuation.",
      "Aggressive hiring: Engineering, Sales, Product roles.",
    ],
    whyItMatters: [
      "Series C at $8B signals strong traction and path to scale.",
      "GTM and engineering expansion indicates growth mode.",
    ],
    risksToWatch: ["None significant this week."],
    whereYouCanHelp: [
      "Intro sales or engineering candidates.",
      "Offer customer or partner introductions.",
    ],
    questionsForCall: [
      "What's the plan for deploying the new capital?",
      "Which roles are highest priority?",
    ],
    signalIdsBySection: { whatChanged: [["s-demo-ramp-1"], ["s-demo-ramp-2"]] },
    partnerTake: {
      take: "Ramp just raised a massive Series C at $8B—this is a strong re-engagement opportunity. The valuation signals strong traction, and aggressive hiring shows they're in hypergrowth mode. Reach out with relevant talent or customer intros.",
      action: "re-engage",
      confidence: 0.75,
      rationaleBullets: [
        "Series C at $8B signals exceptional traction",
        "Aggressive hiring indicates hypergrowth",
        "Capital deployment creates opportunities",
      ],
    },
    confidenceModifiers: {
      increases: "If hiring accelerates or they secure major customers, confidence increases significantly.",
      decreases: "If hiring stalls or capital deployment is slow, confidence decreases.",
    },
    momentumScore: 4.5,
    momentumStatus: "green",
  },
  {
    id: "brief-brex-1",
    companyId: "brex",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    whatChanged: [
      "Brex shifts focus from SMB to enterprise.",
      "CEO posted about strategic repositioning on LinkedIn.",
    ],
    whyItMatters: [
      "Strategic shift may impact existing SMB customers.",
      "Enterprise focus signals higher-value market opportunity but execution risk.",
    ],
    risksToWatch: [
      "SMB customer churn during transition.",
      "Enterprise sales execution challenges.",
    ],
    whereYouCanHelp: [
      "Offer strategic guidance on enterprise positioning.",
      "Intro enterprise customers or sales talent.",
    ],
    questionsForCall: [
      "What's driving the strategic shift?",
      "How are existing SMB customers responding?",
    ],
    signalIdsBySection: { whatChanged: [["s-demo-brex-1"], ["s-demo-brex-2"]] },
    partnerTake: {
      take: "Brex is pivoting from SMB to enterprise—this is a monitor situation with caution. Strategic pivots are risky, especially when moving away from existing customers. Watch for customer churn and execution signals before re-engaging.",
      action: "monitor",
      confidence: 0.5,
      rationaleBullets: [
        "Strategic pivot signals market pressure",
        "SMB customer churn is a risk",
        "Enterprise execution is challenging",
      ],
    },
    confidenceModifiers: {
      increases: "If enterprise traction is strong or SMB churn is minimal, confidence increases.",
      decreases: "If SMB churn escalates or enterprise execution falters, confidence decreases significantly.",
    },
    momentumScore: 1.2,
    momentumStatus: "yellow",
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
  
  // Demo companies get richer signal texts
  const demoCompanyIds = ['airbnb', 'coinbase', 'stripe', 'dropbox', 'reddit', 'doordash', 'twitch', 'gusto', 'instacart', 'ramp', 'brex', 'openai'];
  if (demoCompanyIds.includes(companyId)) {
    return [
      { id: `st-${companyId}-1`, companyId, text: "Hiring activity increased significantly", type: "custom", format: "text", category: "Hiring", iconName: "TrendingUp", createdAt: now, updatedAt: now },
      { id: `st-${companyId}-2`, companyId, text: "Product launch or major update announcement", type: "custom", format: "text", category: "Product", iconName: "Rocket", createdAt: now, updatedAt: now },
      { id: `st-${companyId}-3`, companyId, text: "Company recently raised funding", type: "custom", format: "text", category: "Funding", iconName: "DollarSign", createdAt: now, updatedAt: now },
    ];
  }
  
  return [
    { id: `st-${companyId}-1`, companyId, text: "Company recently raised funding", type: "custom", format: "text", category: "Funding", iconName: "DollarSign", createdAt: now, updatedAt: now },
    { id: `st-${companyId}-2`, companyId, text: "New executive hires detected", type: "custom", format: "text", category: "Leadership", iconName: "UserPlus", createdAt: now, updatedAt: now },
  ];
}

export function getStandardSignalTexts(): SignalText[] {
  const now = new Date().toISOString();
  return [
    { id: "st-standard-1", companyId: null, text: "Hiring activity increased significantly", type: "standard", format: "text", category: "Hiring", iconName: "TrendingUp", createdAt: now, updatedAt: now },
    { id: "st-standard-2", companyId: null, text: "Product launch or major update announcement", type: "standard", format: "text", category: "Product", iconName: "Rocket", createdAt: now, updatedAt: now },
  ];
}
