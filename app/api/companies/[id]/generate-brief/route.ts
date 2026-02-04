import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCompany, getSignals, getRoles, getPeopleChanges, getSignalTexts } from "@/lib/data";
import OpenAI from "openai";
import {
  computeMomentum,
  getMomentumStatus,
  validateInsights,
  toConfidenceLevel,
  determinePartnerAction,
} from "@/lib/brief-utils";
import { computeHiringVelocity, computePressSpike, generateBenchmarkContext } from "@/lib/benchmarking";
import type { Insight, Evidence, PartnerTake, Play, ConfidenceModifier, PartnerAction, ConfidenceLevel } from "@/lib/types";

function sendSSE(controller: ReadableStreamDefaultController, event: string, data: unknown) {
  const json = JSON.stringify(data);
  controller.enqueue(new TextEncoder().encode(`event: ${event}\ndata: ${json}\n\n`));
}

async function streamOpenAICompletion(
  openai: OpenAI,
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  controller: ReadableStreamDefaultController,
  sectionName: string
): Promise<string> {
  let accumulatedContent = "";
  
  try {
    sendSSE(controller, "section_start", { section: sectionName });
    
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        accumulatedContent += content;
        // Send chunks to frontend for progressive rendering
        sendSSE(controller, "section_chunk", { section: sectionName, chunk: content });
      }
    }

    // Send complete section
    if (accumulatedContent.trim()) {
      sendSSE(controller, "section_complete", { section: sectionName });
      return accumulatedContent;
    }
    return "";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[FundWatch generate-brief] Error streaming ${sectionName}:`, msg);
    sendSSE(controller, "error", { error: `Failed to generate ${sectionName}: ${msg}` });
    throw err;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log("[FundWatch generate-brief] Starting streaming brief generation for company id:", id);

  const supabase = createSupabaseServerClient();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!supabase) {
    console.error("[FundWatch generate-brief] Abort: Supabase not configured");
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  if (!apiKey) {
    console.error("[FundWatch generate-brief] Abort: OPENAI_API_KEY not set");
    return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 503 });
  }

  const company = await getCompany(id);
  if (!company) {
    console.error("[FundWatch generate-brief] Abort: Company not found:", id);
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  // Create streaming response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        console.log("[FundWatch generate-brief] Company:", company.name, "| Fetching signals, roles, people, signalTexts...");

        const [signals, roles, peopleChanges, signalTexts] = await Promise.all([
          getSignals(id),
          getRoles(id),
          getPeopleChanges(id),
          getSignalTexts(id),
        ]);

        const openai = new OpenAI({ apiKey });
        console.log("[FundWatch generate-brief] Context: signals=", signals.length, "roles=", roles.length, "peopleChanges=", peopleChanges.length, "signalTexts=", signalTexts.length);

        // Build context for AI with signal IDs for tracking
        const signalsWithIds = signals.map((s, idx) => ({ ...s, displayId: idx + 1 }));
        const signalsText = signals.length > 0
          ? signalsWithIds.map((s) => `[S${s.displayId}] ${s.source}: ${s.summary} (${s.timestamp}) - ${s.externalUrl}`).join("\n")
          : "No signals found yet.";

        const rolesText = roles.length > 0
          ? roles
              .filter((r) => r.status === "new" || r.status === "ongoing")
              .map((r) => `- ${r.title} (${r.roleType}, ${r.status})`)
              .join("\n")
          : "No open roles.";

        const peopleText = peopleChanges.length > 0
          ? peopleChanges.map((p) => `- ${p.name} (${p.role}) ${p.changeType === "joined" ? "joined" : "left"}`).join("\n")
          : "No people changes.";

        const signalTextsSection = signalTexts.length > 0
          ? `\n\nSIGNAL PATTERNS TO CONSIDER:\n${signalTexts.map((st, i) => `${i + 1}. ${st.text}${st.type === "custom" ? " (custom)" : ""}`).join("\n")}`
          : "";

        // Compute benchmarking metrics
        const hiringMetrics = computeHiringVelocity(roles);
        const pressMetrics = computePressSpike(signals);
        const benchmarkContext = generateBenchmarkContext({
          hiringVelocity: hiringMetrics.velocity,
          pressSpike: pressMetrics.spike,
          rolesLast14d: hiringMetrics.last14d,
          rolesPrev14d: hiringMetrics.prev14d,
          mentions7d: pressMetrics.mentions7d,
          avgMentions30d: pressMetrics.avgMentions30d,
        });

        // Fetch last brief for prior-context continuity
        let priorContext = "";
        const { data: lastBrief } = await supabase
          .from("company_briefs")
          .select("*")
          .eq("company_id", id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (lastBrief) {
          const lb = lastBrief as { what_changed?: string[]; why_it_matters?: string[]; created_at?: string };
          priorContext = `
PREVIOUS MEMO (for context; build on this, highlight what is new or unchanged; do not repeat verbatim):
Created: ${lb.created_at ?? "unknown"}
What changed: ${(lb.what_changed ?? []).join(" | ")}
Why it matters: ${(lb.why_it_matters ?? []).join(" | ")}
`;
        }

        // Generate Insights with Evidence (Observed vs Inferred) - non-streaming, computed from signals
        const insights: Insight[] = signals.map((signal) => {
          const text = signal.summary.toLowerCase();
          let claimType: string | undefined;
          let kind: "observed" | "inferred" = "observed";
          let confidence = 0.8;

          if (text.includes("funding") || text.includes("raised") || text.includes("capital")) {
            claimType = "funding";
            confidence = signal.source === "News" ? 0.9 : 0.7;
          } else if (text.includes("hiring") && (text.includes("increase") || text.includes("spike"))) {
            claimType = "hiring_increase";
            kind = "inferred";
            confidence = 0.7;
          } else if (text.includes("hiring") && (text.includes("pause") || text.includes("freeze") || text.includes("slowdown"))) {
            claimType = "hiring_freeze";
            confidence = 0.8;
          } else if (text.includes("executive") || text.includes("cfo") || text.includes("cto") || text.includes("ceo")) {
            claimType = "exec_hire";
            confidence = 0.85;
          } else if (text.includes("product") || text.includes("launch")) {
            claimType = "product_launch";
            confidence = 0.75;
          } else if (text.includes("partnership") || text.includes("customer")) {
            claimType = "partnership";
            confidence = 0.7;
          } else if (text.includes("negative") || text.includes("controversy")) {
            claimType = "negative_press";
            confidence = 0.8;
          } else if (text.includes("leadership") && (text.includes("change") || text.includes("departure"))) {
            claimType = "leadership_churn";
            confidence = 0.75;
          }

          const evidence: Evidence = {
            source: signal.source,
            url: signal.externalUrl,
            extractedAt: signal.timestamp,
            quote: signal.summary,
          };

          return {
            claim: signal.summary,
            kind,
            confidence,
            evidence: [evidence],
            claimType,
          };
        });

        const validatedInsights = validateInsights(insights);
        const momentumScore = computeMomentum(validatedInsights);
        const momentumStatus = getMomentumStatus(momentumScore);

        // Stream Partner Take first
        const partnerTakePrompt = `You are a VC partner who is ALREADY INVESTED in ${company.name} as a portfolio company. This is portfolio management, not deal sourcing.

Based on the signals and insights for ${company.name}, generate a decisive "Partner Take" - a single assertive paragraph (2-4 sentences) that answers:
1. What changed (be specific)
2. What it likely means for your portfolio investment (your interpretation)
3. What I'd do next as an existing investor (actionable - e.g., re-engage with the team, provide support, make introductions, NOT explore new partnerships)

Signals summary:
${signals.slice(0, 5).map((s) => `- ${s.source}: ${s.summary}`).join("\n")}

STYLE: Write in a direct, conversational tone. Avoid corporate jargon and repetitive phrasing. Be opinionated and specific. Remember: you're managing an existing portfolio company relationship.

Return JSON:
{
  "take": "2-4 sentence assertive paragraph",
  "action": "re-engage" | "monitor" | "ignore",
  "confidence": 0.0 | 0.25 | 0.5 | 0.75 | 1.0,
  "rationaleBullets": ["bullet 1", "bullet 2", "bullet 3"]
}`;

        let partnerTake: PartnerTake | undefined;
        try {
          const partnerTakeContent = await streamOpenAICompletion(
            openai,
            [{ role: "user", content: partnerTakePrompt }],
            controller,
            "partnerTake"
          );
          if (partnerTakeContent.trim()) {
            const takeData = JSON.parse(partnerTakeContent);
            if (takeData.take && takeData.action && takeData.confidence !== undefined) {
              partnerTake = {
                take: takeData.take,
                action: takeData.action as PartnerAction,
                confidence: takeData.confidence as ConfidenceLevel,
                rationaleBullets: Array.isArray(takeData.rationaleBullets) ? takeData.rationaleBullets.slice(0, 3) : [],
              };
              sendSSE(controller, "section_data", { section: "partnerTake", data: partnerTake });
            }
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.error("[FundWatch generate-brief] Failed to generate partner take:", errMsg);
        }

        // Stream main brief
        const mainBriefPrompt = `Generate a company memo for ${company.name} (${company.domain}). 

CONTEXT: You are a VC partner who is ALREADY INVESTED in this portfolio company. This is not about exploring new investments or partnerships - you are managing an existing portfolio company relationship. All advice should be tailored from the perspective of an existing investor supporting their portfolio company.

Your framing: "This happened — and here's why you should care." Opinionated synthesis, VC-specific, helpfulness bias.${priorContext}${signalTextsSection}${benchmarkContext}

SIGNALS (search results — what we found):
${signalsText}

OPEN ROLES:
${rolesText}

PEOPLE CHANGES:
${peopleText}

${company.attentionReason ? `ATTENTION REASON: ${company.attentionReason}\n` : ""}
${company.highlightChips.length > 0 ? `HIGHLIGHTS: ${company.highlightChips.join(", ")}\n` : ""}

Generate a structured brief with the following sections. Return JSON:
{
  "whatChanged": [{"text": "bullet 1", "signalRefs": ["S1", "S2"]}, ...],
  "whyItMatters": [{"text": "bullet 1", "signalRefs": ["S1"]}, ...],
  "risksToWatch": [{"text": "bullet 1", "signalRefs": []}, ...],
  "whereYouCanHelp": [{"text": "bullet 1", "signalRefs": []}, ...],
  "questionsForCall": [{"text": "bullet 1", "signalRefs": []}, ...]
}

SECTION DESCRIPTIONS (STRICT LIMITS):
- "whatChanged": What actually happened. MAX 5 bullets. Be factual and specific.
- "whyItMatters": Why these changes matter for a VC partner who is already invested. MAX 5 bullets. REQUIRED. Strategic implications, market signals, competitive dynamics. Focus on portfolio value and company health.
- "risksToWatch": Potential concerns for the portfolio investment. MAX 3 bullets.
- "whereYouCanHelp": Actionable ways you (as an existing investor) can add value to your portfolio company. MAX 3 bullets. Focus on support, introductions, strategic guidance - NOT exploring new partnerships.
- "questionsForCall": Strategic questions to ask your portfolio company. MAX 3 bullets.

CRITICAL STYLE GUIDELINES:
- "This happened — and here's why you should care." Opinionated, not generic.
- Vary your tone. Be specific and concrete. Write like explaining to a colleague.
- Remember: You are already invested. This is portfolio management, not deal sourcing.
- For each bullet, include "signalRefs" array with signal IDs (e.g. ["S1"]) that support it. Use [] if inferred.`;

        let parsed: {
          whatChanged?: Array<{ text: string; signalRefs?: string[] }> | string[];
          whyItMatters?: Array<{ text: string; signalRefs?: string[] }> | string[];
          risksToWatch?: Array<{ text: string; signalRefs?: string[] }> | string[];
          whereYouCanHelp?: Array<{ text: string; signalRefs?: string[] }> | string[];
          questionsForCall?: Array<{ text: string; signalRefs?: string[] }> | string[];
        } = {};

        try {
          const mainBriefContent = await streamOpenAICompletion(
            openai,
            [{ role: "user", content: mainBriefPrompt }],
            controller,
            "mainBrief"
          );
          if (mainBriefContent.trim()) {
            parsed = JSON.parse(mainBriefContent);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[FundWatch generate-brief] Failed to parse main brief:", msg);
          sendSSE(controller, "error", { error: "Failed to generate main brief" });
        }

        // Helper to normalize brief items
        const normalizeSection = (section: typeof parsed.whatChanged): { text: string; signalIds: string[] }[] => {
          if (!Array.isArray(section)) return [];
          return section.map((item) => {
            if (typeof item === "string") {
              return { text: item, signalIds: [] };
            }
            const signalIds = (item.signalRefs || [])
              .map((ref: string) => {
                const match = ref.match(/^S(\d+)$/);
                if (match) {
                  const idx = parseInt(match[1], 10) - 1;
                  return signalsWithIds[idx]?.id;
                }
                return null;
              })
              .filter((id): id is string => id !== null);
            return { text: item.text, signalIds };
          });
        };

        const whatChanged = normalizeSection(parsed.whatChanged).slice(0, 5);
        let whyItMatters = normalizeSection(parsed.whyItMatters).slice(0, 5);
        const risksToWatch = normalizeSection(parsed.risksToWatch).slice(0, 3);
        const whereYouCanHelp = normalizeSection(parsed.whereYouCanHelp).slice(0, 3);
        const questionsForCall = normalizeSection(parsed.questionsForCall).slice(0, 3);

        if (whyItMatters.length === 0 && whatChanged.length > 0) {
          console.warn("[FundWatch generate-brief] whyItMatters was empty, generating fallback");
          whyItMatters = whatChanged.slice(0, 3).map((item) => ({
            text: `This change suggests ${item.text.toLowerCase().replace(/^the /i, "")} - worth monitoring for strategic implications.`,
            signalIds: item.signalIds,
          }));
        }

        const signalIdsBySection: Record<string, string[][]> = {
          whatChanged: whatChanged.map((item) => item.signalIds),
          whyItMatters: whyItMatters.map((item) => item.signalIds),
          risksToWatch: risksToWatch.map((item) => item.signalIds),
          whereYouCanHelp: whereYouCanHelp.map((item) => item.signalIds),
          questionsForCall: questionsForCall.map((item) => item.signalIds),
        };

        sendSSE(controller, "section_data", {
          section: "mainBrief",
          data: {
            whatChanged: whatChanged.map((item) => item.text),
            whyItMatters: whyItMatters.map((item) => item.text),
            risksToWatch: risksToWatch.map((item) => item.text),
            whereYouCanHelp: whereYouCanHelp.map((item) => item.text),
            questionsForCall: questionsForCall.map((item) => item.text),
            signalIdsBySection,
          },
        });

        // Stream Confidence Modifiers
        const modifiersPrompt = `You are a VC partner who is ALREADY INVESTED in ${company.name} as a portfolio company. Based on the insights, generate 2 bullets describing what would change your confidence in this portfolio investment:

Signals:
${signals.slice(0, 5).map((s) => `- ${s.summary}`).join("\n")}

Return JSON:
{
  "increases": "If X happens, confidence in the portfolio investment increases",
  "decreases": "If Y happens, confidence in the portfolio investment decreases"
}`;

        let confidenceModifiers: ConfidenceModifier | undefined;
        try {
          const modifiersContent = await streamOpenAICompletion(
            openai,
            [{ role: "user", content: modifiersPrompt }],
            controller,
            "modifiers"
          );
          if (modifiersContent.trim()) {
            const modifiersData = JSON.parse(modifiersContent);
            if (modifiersData.increases && modifiersData.decreases) {
              confidenceModifiers = {
                increases: modifiersData.increases,
                decreases: modifiersData.decreases,
              };
              sendSSE(controller, "section_data", { section: "modifiers", data: confidenceModifiers });
            }
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.error("[FundWatch generate-brief] Failed to generate confidence modifiers:", errMsg);
        }

        // Stream Plays
        const playsPrompt = `You are a VC partner who is ALREADY INVESTED in ${company.name} as a portfolio company. Generate 2-3 actionable "plays" - specific actions you should take to support your existing portfolio company.

Each play should have:
- title: Specific action from an existing investor's perspective (e.g., "Re-engage with the team to discuss growth", "Make strategic introductions", "Provide guidance on X"). DO NOT suggest exploring new partnerships or investments - you're already invested.
- when: Trigger condition that led to this play
- why: 1 sentence explanation of why this action helps your portfolio company
- suggestedMessage: Optional 2-3 line message template (written as if to your portfolio company team)

STYLE: Vary your language and tone. Write like you're giving direct advice to a colleague. Avoid repetitive phrasing across plays. Focus on portfolio support, not deal sourcing.

Signals:
${signals.slice(0, 5).map((s) => `- ${s.summary}`).join("\n")}

Return JSON:
{
  "plays": [
    {
      "title": "play title",
      "when": "trigger condition",
      "why": "explanation",
      "suggestedMessage": "optional message template"
    }
  ]
}`;

        let plays: Play[] = [];
        try {
          const playsContent = await streamOpenAICompletion(
            openai,
            [{ role: "user", content: playsPrompt }],
            controller,
            "plays"
          );
          if (playsContent.trim()) {
            const playsData = JSON.parse(playsContent);
            if (Array.isArray(playsData.plays)) {
              plays = playsData.plays.slice(0, 3).map((p: any) => ({
                title: p.title || "",
                when: p.when || "",
                why: p.why || "",
                suggestedMessage: p.suggestedMessage,
              }));
              sendSSE(controller, "section_data", { section: "plays", data: plays });
            }
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.error("[FundWatch generate-brief] Failed to generate plays:", errMsg);
        }

        // Save complete brief to database
        const briefId = `brief-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        
        const brief = {
          id: briefId,
          company_id: id,
          created_at: new Date().toISOString(),
          what_changed: whatChanged.map((item) => item.text),
          why_it_matters: whyItMatters.map((item) => item.text),
          risks_to_watch: risksToWatch.map((item) => item.text),
          where_you_can_help: whereYouCanHelp.map((item) => item.text),
          questions_for_call: questionsForCall.map((item) => item.text),
          signal_ids_by_section: signalIdsBySection,
          partner_take: partnerTake || null,
          insights: validatedInsights.length > 0 ? validatedInsights : null,
          plays: plays.length > 0 ? plays : null,
          confidence_modifiers: confidenceModifiers || null,
          momentum_score: momentumScore,
          momentum_status: momentumStatus,
        };

        const { error, data: insertedBrief } = await supabase.from("company_briefs").insert(brief).select().single();

        if (error) {
          console.error("[FundWatch generate-brief] Supabase insert failed:", error.code, error.message, error.details);
          sendSSE(controller, "error", { error: error.message });
          controller.close();
          return;
        }

        console.log(`[FundWatch generate-brief] Generated brief ${briefId} for ${company.name}`);
        sendSSE(controller, "brief_complete", { briefId, brief: insertedBrief });
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const stack = err instanceof Error ? err.stack : undefined;
        console.error("[FundWatch generate-brief] Unhandled error:", msg);
        if (stack) console.error("[FundWatch generate-brief] Stack:", stack);
        sendSSE(controller, "error", { error: msg });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
