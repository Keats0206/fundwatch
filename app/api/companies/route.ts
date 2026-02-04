import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * System-wide default signals that get automatically created for each new company
 */
const SYSTEM_WIDE_SIGNALS = [
  { text: "Funding rounds or capital raises", format: "text" as const },
  { text: "Key executive hires or departures", format: "text" as const },
  { text: "Significant hiring increases or pauses", format: "text" as const },
  { text: "Product launches or major feature announcements", format: "text" as const },
  { text: "Partnership announcements or customer wins", format: "text" as const },
  { text: "Leadership or organizational changes", format: "text" as const },
  { text: "Negative press or controversy", format: "text" as const },
  { text: "Website or branding changes", format: "text" as const },
];

type HealthStatus = "green" | "yellow" | "red";

function generateCompanyId(): string {
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    const missing = [];
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    return NextResponse.json(
      {
        error: "Supabase not configured. Missing: " + missing.join(", ") + ". See README for setup instructions.",
      },
      { status: 503 }
    );
  }

  let body: {
    fundId?: string;
    name?: string;
    domain?: string;
    health?: HealthStatus;
    attentionReason?: string;
    highlightChips?: string[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { fundId, name, domain, health = "green", attentionReason, highlightChips } = body;
  if (!fundId || !name || !domain) {
    return NextResponse.json(
      { error: "fundId, name, and domain are required" },
      { status: 400 }
    );
  }

  const id = generateCompanyId();
  const lastUpdated = new Date().toISOString();
  const chips = Array.isArray(highlightChips) ? highlightChips : [];

  const companyData = {
    id,
    fund_id: fundId,
    name: name.trim(),
    domain: domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""),
    health,
    last_updated: lastUpdated,
    attention_reason: attentionReason?.trim() || null,
    highlight_chips: chips,
  };

  console.log("[FundWatch companies] Attempting insert:", { id, fundId, name: name.trim() });
  const serviceKeyFormat = process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith("sb_secret_")
    ? "new format (sb_secret_)"
    : process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith("eyJ")
    ? "legacy JWT"
    : "unknown";
  console.log("[FundWatch companies] Service role key format:", serviceKeyFormat);
  
  // Warn if mixing key formats
  const anonKeyFormat = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith("sb_publishable_") ? "new" : "legacy";
  if (anonKeyFormat === "new" && serviceKeyFormat === "legacy JWT") {
    console.warn("[FundWatch companies] ⚠️  Mixing key formats: Using new publishable key with legacy service_role key. Consider updating to new secret key format.");
  }

  try {
    const { data, error } = await supabase.from("companies").insert(companyData).select();

    if (error) {
      console.error("[FundWatch companies] Insert failed:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        {
          error: error.message || "Failed to insert company",
          code: error.code,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    console.log("[FundWatch companies] Insert successful:", data);
    console.log("[FundWatch companies] Created company:", { id, name: name.trim(), fundId });

    // Create system-wide default signals for this company
    try {
      const now = new Date().toISOString();
      const signalInserts = SYSTEM_WIDE_SIGNALS.map((signal, index) => ({
        id: `st-${id}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        company_id: id,
        text: signal.text,
        format: signal.format,
        type: "custom" as const,
        created_at: now,
        updated_at: now,
      }));

      const { error: signalsError } = await supabase
        .from("signal_texts")
        .insert(signalInserts);

      if (signalsError) {
        console.error("[FundWatch companies] Failed to create system signals:", signalsError);
        // Don't fail the company creation if signals fail
      } else {
        console.log(`[FundWatch companies] Created ${signalInserts.length} system-wide signals for ${name.trim()}`);
      }
    } catch (err) {
      console.error("[FundWatch companies] Error creating system signals:", err);
      // Don't fail the company creation if signals fail
    }

    return NextResponse.json({
      id,
      fundId,
      name: name.trim(),
      domain: domain.trim(),
      health,
      lastUpdated,
      attentionReason: attentionReason?.trim() || undefined,
      highlightChips: chips,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const isDnsError = errorMessage.includes("ENOTFOUND") || errorMessage.includes("getaddrinfo");
    
    console.error("[FundWatch companies] Network/connection error:", {
      message: errorMessage,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      isDnsError,
    });
    
    if (isDnsError) {
      return NextResponse.json(
        {
          error: `Cannot connect to Supabase: DNS lookup failed for ${process.env.NEXT_PUBLIC_SUPABASE_URL}`,
          details: "The Supabase project URL appears to be incorrect. Verify the URL in your Supabase dashboard (Settings → API).",
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      {
        error: `Connection failed: ${errorMessage}`,
        details: "Check your Supabase URL and service role key.",
      },
      { status: 503 }
    );
  }
}
