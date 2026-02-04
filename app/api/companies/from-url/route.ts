import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const MAX_BODY_LENGTH = 12000;

function stripHtml(html: string): string {
  const noScript = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  const noStyle = noScript.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  const text = noStyle.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.slice(0, MAX_BODY_LENGTH);
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set. Add it to .env.local to use URL import." },
      { status: 503 }
    );
  }

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const rawUrl = body.url?.trim();
  if (!rawUrl) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  let html: string;
  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FundWatch/1.0; +https://fundwatch.app)",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${res.status} ${res.statusText}` },
        { status: 422 }
      );
    }
    html = await res.text();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Could not fetch URL: ${msg}` },
      { status: 422 }
    );
  }

  const text = stripHtml(html);
  if (!text || text.length < 50) {
    return NextResponse.json(
      { error: "Page has too little text to extract company info." },
      { status: 422 }
    );
  }

  const openai = new OpenAI({ apiKey });

  const systemPrompt = `You are a helper that extracts company information for a VC portfolio tracker.
Given webpage text, return a JSON object with:
- name: company or product name (string)
- domain: primary domain only, e.g. "acme.com" (string, no protocol or path)
- attentionReason: optional one-line reason the company might need attention, or null
- highlightChips: optional array of 1-3 short labels, e.g. ["Series B", "Hiring", "New product"], or empty array
Return only valid JSON, no markdown or extra text.`;

  const userPrompt = `Extract company info from this webpage (domain: ${url.hostname}):\n\n${text}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "AI returned no content" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content) as {
      name?: string;
      domain?: string;
      attentionReason?: string | null;
      highlightChips?: string[] | null;
    };

    const name = typeof parsed.name === "string" ? parsed.name.trim() : url.hostname.replace(/^www\./, "").split(".")[0];
    const domain = typeof parsed.domain === "string" ? parsed.domain.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "") : url.hostname.replace(/^www\./, "");
    const attentionReason = typeof parsed.attentionReason === "string" ? parsed.attentionReason.trim() || undefined : undefined;
    const highlightChips = Array.isArray(parsed.highlightChips)
      ? parsed.highlightChips.filter((s): s is string => typeof s === "string").map((s) => s.trim()).filter(Boolean)
      : undefined;

    return NextResponse.json({
      name: name || domain,
      domain,
      attentionReason,
      highlightChips: highlightChips ?? [],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[FundWatch from-url] OpenAI error:", msg);
    return NextResponse.json(
      { error: `AI extraction failed: ${msg}` },
      { status: 500 }
    );
  }
}
