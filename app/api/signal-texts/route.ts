import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSignalText, createStandardSignalText, getStandardSignalTexts } from "@/lib/data";

export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const standardSignals = await getStandardSignalTexts();
    return NextResponse.json({ signals: standardSignals });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { companyId, text, format, category, iconName, isStandard } = body;

    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    // Auto-detect format: if text looks like a URL, use "url", otherwise "text"
    const detectedFormat = format || (text.trim().startsWith("http") ? "url" : "text");
    
    if (isStandard) {
      // Create standard signal (no companyId)
      const signal = await createStandardSignalText(
        text,
        detectedFormat as "text" | "url",
        category || null,
        iconName || null
      );
      return NextResponse.json({ signal });
    } else {
      // Create custom signal (requires companyId)
      if (!companyId) {
        return NextResponse.json({ error: "companyId is required for custom signals" }, { status: 400 });
      }
      const signal = await createSignalText(
        companyId,
        text,
        detectedFormat as "text" | "url",
        category || null,
        iconName || null
      );
      return NextResponse.json({ signal });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
