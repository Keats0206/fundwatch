import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCompany, getSignalTexts } from "@/lib/data";
import OpenAI from "openai";
import crypto from "crypto";

const CACHE_WINDOW_HOURS = 24;
const MAX_BODY_LENGTH = 12000;
const MAX_ARTICLE_AGE_DAYS = 90; // Filter out articles older than this

function stripHtml(html: string): string {
  const noScript = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  const noStyle = noScript.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  const text = noStyle.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.slice(0, MAX_BODY_LENGTH);
}

function hashContent(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function sendSSE(controller: ReadableStreamDefaultController, event: string, data: unknown) {
  const json = JSON.stringify(data);
  controller.enqueue(new TextEncoder().encode(`event: ${event}\ndata: ${json}\n\n`));
}

async function discoverUrls(domain: string, companyName: string, openai: OpenAI): Promise<Array<{ url: string; label: string }>> {
  const mainUrl = `https://${domain}`;
  console.log(`[FundWatch discoverUrls] Fetching ${mainUrl} for ${companyName}`);
  let html: string;
  try {
    const res = await fetch(mainUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FundWatch/1.0)",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.warn(`[FundWatch discoverUrls] HTTP ${res.status} ${res.statusText} for ${mainUrl}`);
      return [];
    }
    html = await res.text();
    console.log(`[FundWatch discoverUrls] Fetched ${html.length} bytes from ${mainUrl}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[FundWatch discoverUrls] Fetch failed for ${mainUrl}:`, msg);
    return [];
  }

  const text = stripHtml(html);
  console.log(`[FundWatch discoverUrls] Stripped HTML to ${text.length} chars`);
  if (text.length < 50) {
    console.warn(`[FundWatch discoverUrls] Content too short (${text.length} chars), skipping AI analysis`);
    return [];
  }

  const prompt = `Given this company website (${domain}, name: ${companyName}), extract URLs for:
- Careers/jobs page (e.g., /careers, /jobs, /hiring)
- Blog/news page (e.g., /blog, /news, /updates)
- LinkedIn company page URL (if mentioned)

Return JSON: {"urls": [{"url": "full URL", "label": "Careers"|"Blog"|"LinkedIn"}]}
Only return URLs that likely exist. Return empty array if none found.`;

  try {
    console.log(`[FundWatch discoverUrls] Asking AI to extract URLs from ${domain}`);
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
    const aiResponse = completion.choices[0]?.message?.content ?? "{}";
    console.log(`[FundWatch discoverUrls] AI response:`, aiResponse);
    const parsed = JSON.parse(aiResponse);
    const urls = Array.isArray(parsed.urls) ? parsed.urls : [];
    console.log(`[FundWatch discoverUrls] Extracted ${urls.length} URLs:`, urls);
    return urls;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[FundWatch discoverUrls] AI extraction failed:`, msg);
    return [];
  }
}

async function checkUrlForChanges(
  url: string,
  lastHash: string | null,
  controller: ReadableStreamDefaultController,
  isFirstRun: boolean = false
): Promise<{ changed: boolean; hash: string; content?: string }> {
  try {
    sendSSE(controller, "checking", { url, status: "fetching" });
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FundWatch/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      sendSSE(controller, "checking", { url, status: "error", error: `${res.status} ${res.statusText}` });
      return { changed: false, hash: lastHash ?? "", content: undefined };
    }
    const html = await res.text();
    const text = stripHtml(html);
    
    console.log(`[FundWatch check-signals] checkUrlForChanges: ${url}, text length: ${text.length}, isFirstRun: ${isFirstRun}, lastHash: ${lastHash?.slice(0, 8) || "null"}...`);
    
    // If content is too short/empty, still process if it's a first run (to create baseline)
    if (text.length < 50 && !isFirstRun) {
      console.log(`[FundWatch check-signals] Content too short (${text.length} chars) and not first run, skipping`);
      sendSSE(controller, "checking", { url, status: "unchanged" });
      return { changed: false, hash: lastHash ?? "", content: undefined };
    }
    
    const hash = hashContent(text);
    const changed = lastHash !== null && hash !== lastHash;
    
    console.log(`[FundWatch check-signals] checkUrlForChanges: hash=${hash.slice(0, 8)}..., changed=${changed}, willReturnContent=${isFirstRun || changed}`);
    
    // On first run (no previous hash), always return content so we can create an initial signal
    // Also return content if it changed
    if (isFirstRun || changed) {
      sendSSE(controller, "checking", { url, status: isFirstRun ? "initial_check" : "changed" });
      return { changed: changed || isFirstRun, hash, content: text };
    }
    
    sendSSE(controller, "checking", { url, status: "unchanged" });
    return { changed: false, hash, content: undefined };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    sendSSE(controller, "checking", { url, status: "error", error: msg });
    return { changed: false, hash: lastHash ?? "", content: undefined };
  }
}

async function summarizeInitialContent(
  url: string,
  label: string,
  content: string,
  openai: OpenAI,
  signalTexts: string[] = []
): Promise<string> {
  const signalTextsSection = signalTexts.length > 0
    ? `\n\nSIGNAL PATTERNS TO LOOK FOR:\n${signalTexts.map((st, i) => `${i + 1}. ${st}`).join("\n")}`
    : "";
  
  const prompt = `Summarize what's currently on this ${label} page in 1-2 sentences. Focus on:
- Open job positions (if careers page)
- Recent blog posts or news (if blog/news page)
- Company updates or announcements
- Notable content that would be relevant for tracking${signalTextsSection}

Page content (excerpt):\n${content.slice(0, 3000)}

Summary:`;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
    });
    return completion.choices[0]?.message?.content?.trim() ?? `Initial ${label} page content discovered`;
  } catch {
    return `Initial ${label} page content discovered`;
  }
}

async function summarizeChange(
  url: string,
  label: string,
  oldContent: string | null,
  newContent: string,
  openai: OpenAI,
  signalTexts: string[] = []
): Promise<string> {
  const signalTextsSection = signalTexts.length > 0
    ? `\n\nSIGNAL PATTERNS TO LOOK FOR:\n${signalTexts.map((st, i) => `${i + 1}. ${st}`).join("\n")}`
    : "";
  
  const prompt = `Compare these two versions of a ${label} page and summarize what changed in 1-2 sentences. Focus on hiring, product updates, leadership changes, or notable news.${signalTextsSection}

${oldContent ? `Previous version (excerpt):\n${oldContent.slice(0, 2000)}\n\n` : ""}Current version (excerpt):\n${newContent.slice(0, 2000)}

Summary:`;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
    });
    return completion.choices[0]?.message?.content?.trim() ?? "Content changed";
  } catch {
    return "Content changed";
  }
}

/**
 * Extract publication date from HTML metadata
 */
function extractPublicationDate(html: string): Date | null {
  try {
    // Try article:published_time meta tag
    const publishedMatch = html.match(/<meta\s+(?:property|name)=["']article:published_time["']\s+content=["']([^"']+)["']/i);
    if (publishedMatch) {
      const date = new Date(publishedMatch[1]);
      if (!isNaN(date.getTime())) return date;
    }

    // Try datePublished in JSON-LD
    const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatch) {
      for (const script of jsonLdMatch) {
        try {
          const json = JSON.parse(script.replace(/<script[^>]*>|<\/script>/gi, ''));
          if (json.datePublished) {
            const date = new Date(json.datePublished);
            if (!isNaN(date.getTime())) return date;
          }
        } catch {}
      }
    }

    // Try <time datetime>
    const timeMatch = html.match(/<time[^>]*datetime=["']([^"']+)["'][^>]*>/i);
    if (timeMatch) {
      const date = new Date(timeMatch[1]);
      if (!isNaN(date.getTime())) return date;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Use AI to extract publication date from article text
 */
async function extractDateWithAI(text: string, title: string, openai: OpenAI): Promise<Date | null> {
  try {
    const prompt = `Extract the publication date from this news article. Return only the date in ISO format (YYYY-MM-DD) or null if you can't determine it.

Article title: ${title}
Article text (excerpt): ${text.slice(0, 1500)}

Return JSON: {"date": "2024-01-15" or null}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 50,
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
    if (parsed.date) {
      const date = new Date(parsed.date);
      if (!isNaN(date.getTime())) return date;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if an article is recent enough to include
 */
function isArticleRecent(date: Date | null): boolean {
  if (!date) return true; // If we can't determine date, include it (fallback)
  const ageDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  return ageDays <= MAX_ARTICLE_AGE_DAYS;
}

async function searchNews(
  companyName: string,
  domain: string,
  openai: OpenAI,
  controller: ReadableStreamDefaultController
): Promise<Array<{ url: string; title: string; summary: string }>> {
  try {
    // Build search query for recent news (articles will be filtered to last ${MAX_ARTICLE_AGE_DAYS} days)
    const searchQuery = `${companyName} news -site:${domain}`;
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
    
    console.log(`[FundWatch searchNews] Searching for: ${searchQuery}`);
    sendSSE(controller, "news_search", { message: `Searching Google for recent news about ${companyName}...` });
    
    // Fetch search results
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(15000),
    });
    
    if (!res.ok) {
      console.warn(`[FundWatch searchNews] Search request failed: ${res.status}`);
      return [];
    }
    
    const html = await res.text();
    
    // Parse HTML to extract search results
    // Try multiple patterns for DuckDuckGo HTML results
    const patterns = [
      /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi,
      /<a[^>]*href="([^"]+)"[^>]*class="[^"]*result__a[^"]*"[^>]*>([^<]+)<\/a>/gi,
      /<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>([^<]+)<\/a>/gi, // Fallback: any link with http
    ];
    
    const results: Array<{ url: string; title: string }> = [];
    const seenUrls = new Set<string>();
    const domainLower = domain.toLowerCase().replace(/^www\./, "");
    
    // Try each pattern
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null && results.length < 10) {
        let url = match[1];
        let title = match[2]?.trim() || "";
        
        // Skip if URL is empty or already seen
        if (!url || seenUrls.has(url)) continue;
        
        // Handle DuckDuckGo redirect URLs (they start with //duckduckgo.com/l/?uddg=)
        if (url.startsWith("//duckduckgo.com/l/?uddg=") || url.includes("uddg=")) {
          try {
            const decoded = decodeURIComponent(url.split("uddg=")[1]?.split("&")[0] || "");
            if (decoded.startsWith("http")) {
              url = decoded;
            } else {
              continue; // Skip if we can't extract a valid URL
            }
          } catch {
            continue;
          }
        }
        
        // Skip if not a valid HTTP URL
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          continue;
        }
        
        try {
          const urlObj = new URL(url);
          const urlDomain = urlObj.hostname.toLowerCase().replace(/^www\./, "");
          
          // Skip company's own domain and common non-news domains
          if (urlDomain === domainLower || 
              urlDomain.includes("linkedin.com") ||
              urlDomain.includes("crunchbase.com") ||
              urlDomain.includes("twitter.com") ||
              urlDomain.includes("facebook.com") ||
              urlDomain.includes("instagram.com") ||
              urlDomain.includes("youtube.com") ||
              urlDomain.includes("duckduckgo.com")) {
            continue;
          }
          
          // Prefer news domains (but don't exclude others)
          const isNewsDomain = urlDomain.includes("news") || 
                              urlDomain.includes("press") ||
                              urlDomain.includes("reuters") ||
                              urlDomain.includes("bloomberg") ||
                              urlDomain.includes("techcrunch") ||
                              urlDomain.includes("forbes") ||
                              urlDomain.includes("wsj") ||
                              urlDomain.includes("nytimes") ||
                              urlDomain.includes("theverge") ||
                              urlDomain.includes("axios") ||
                              urlDomain.includes("businesswire") ||
                              urlDomain.includes("prnewswire");
          
          seenUrls.add(url);
          results.push({ url, title: title || urlDomain });
          
          // If we found enough results, break
          if (results.length >= 10) break;
        } catch {
          // Invalid URL, skip
          continue;
        }
      }
      
      // If we found results with this pattern, stop trying others
      if (results.length > 0) break;
    }
    
    // If no results from HTML parsing, try fallback: use AI to generate search URLs
    if (results.length === 0) {
      console.log(`[FundWatch searchNews] HTML parsing found no results, trying AI fallback...`);
      try {
        const fallbackPrompt = `Generate 5 recent news article URLs about "${companyName}" (domain: ${domain}). 
IMPORTANT: Only include articles published within the last ${MAX_ARTICLE_AGE_DAYS} days. Exclude older articles.
Exclude the company's own website (${domain}). Focus on:
- Tech news sites (TechCrunch, The Verge, Axios, etc.)
- Business news (Bloomberg, Forbes, WSJ, etc.)
- Press release sites (BusinessWire, PR Newswire, etc.)
- Industry publications

Return JSON: {"urls": ["https://example.com/article1", "https://example.com/article2", ...]}
Only return URLs that likely exist and are recent (within last ${MAX_ARTICLE_AGE_DAYS} days). If you can't find recent URLs, return empty array.`;
        
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: fallbackPrompt }],
          response_format: { type: "json_object" },
        });
        
        const parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
        const aiUrls = Array.isArray(parsed.urls) ? parsed.urls : [];
        
        for (const url of aiUrls.slice(0, 5)) {
          if (url && typeof url === "string" && url.startsWith("http")) {
            try {
              const urlObj = new URL(url);
              const urlDomain = urlObj.hostname.toLowerCase().replace(/^www\./, "");
              if (urlDomain !== domainLower && !urlDomain.includes("linkedin.com")) {
                results.push({ url, title: urlDomain });
              }
            } catch {
              // Skip invalid URLs
            }
          }
        }
      } catch (err) {
        console.warn(`[FundWatch searchNews] AI fallback failed:`, err);
      }
    }
    
    // Take top 5 results
    const topResults = results.slice(0, 5);
    console.log(`[FundWatch searchNews] Found ${topResults.length} search results`);
    
    if (topResults.length === 0) {
      return [];
    }
    
    // Fetch and summarize each article
    const articles: Array<{ url: string; title: string; summary: string }> = [];
    
    for (const result of topResults) {
      try {
        sendSSE(controller, "news_search", { message: `Analyzing: ${result.title.substring(0, 50)}...` });
        
        // Fetch article content
        const articleRes = await fetch(result.url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          },
          signal: AbortSignal.timeout(10000),
        });
        
        if (!articleRes.ok) {
          console.warn(`[FundWatch searchNews] Failed to fetch ${result.url}: ${articleRes.status}`);
          // Still add it with a basic summary
          articles.push({
            url: result.url,
            title: result.title,
            summary: `Recent news article about ${companyName}`,
          });
          continue;
        }
        
        const articleHtml = await articleRes.text();
        const articleText = stripHtml(articleHtml).slice(0, 3000);
        
        if (articleText.length < 100) {
          // Too short, skip
          continue;
        }

        // Extract publication date
        let publicationDate: Date | null = extractPublicationDate(articleHtml);
        if (!publicationDate) {
          // Try AI extraction as fallback
          publicationDate = await extractDateWithAI(articleText, result.title, openai);
        }

        // Filter out old articles
        if (!isArticleRecent(publicationDate)) {
          const ageDays = publicationDate 
            ? Math.floor((Date.now() - publicationDate.getTime()) / (1000 * 60 * 60 * 24))
            : 'unknown';
          console.log(`[FundWatch searchNews] Skipping old article: ${result.title.substring(0, 50)} (${ageDays} days old)`);
          continue;
        }
        
        // Use AI to summarize the article
        const summaryPrompt = `Summarize this recent news article about "${companyName}" in 1-2 sentences. Focus on key information relevant to investors (funding, product launches, leadership changes, milestones, partnerships, etc.). Note: This article should be from the last ${MAX_ARTICLE_AGE_DAYS} days.

Article title: ${result.title}
Article content (excerpt): ${articleText.slice(0, 2000)}

Summary:`;
        
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: summaryPrompt }],
          max_tokens: 150,
        });
        
        const summary = completion.choices[0]?.message?.content?.trim() ?? `Recent news about ${companyName}`;
        
        articles.push({
          url: result.url,
          title: result.title,
          summary,
        });
        
        console.log(`[FundWatch searchNews] Processed article: ${result.title.substring(0, 50)}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[FundWatch searchNews] Error processing ${result.url}:`, msg);
        // Still add it with basic info
        articles.push({
          url: result.url,
          title: result.title,
          summary: `Recent news article about ${companyName}`,
        });
      }
    }
    
    console.log(`[FundWatch searchNews] Returning ${articles.length} articles`);
    return articles;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[FundWatch searchNews] Search failed:`, msg);
    return [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!supabase) {
    return new Response("Supabase not configured", { status: 503 });
  }
  if (!apiKey) {
    return new Response("OPENAI_API_KEY not set", { status: 503 });
  }

  const forceRefresh = request.nextUrl.searchParams.get("force") === "true";
  const company = await getCompany(id);
  if (!company) {
    return new Response("Company not found", { status: 404 });
  }
  
  // Allow demo companies without auth check
  const isDemo = company.fundId === "demo";
  if (!isDemo) {
    // For non-demo companies, check auth
    const { getCookieName, validateFundId } = await import("@/lib/auth");
    const cookieName = getCookieName();
    const cookie = request.cookies.get(cookieName);
    const fundId = cookie?.value ?? null;
    const isValid = fundId ? validateFundId(fundId) : false;
    
    if (!fundId || !isValid) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const openai = new OpenAI({ apiKey });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        sendSSE(controller, "start", { companyId: id, companyName: company.name });

        const { data: cache } = await supabase
          .from("company_signal_cache")
          .select("*")
          .eq("company_id", id)
          .single();

        if (!forceRefresh && cache) {
          const hoursSinceCheck = (Date.now() - new Date(cache.last_checked).getTime()) / (1000 * 60 * 60);
          if (hoursSinceCheck < CACHE_WINDOW_HOURS) {
            sendSSE(controller, "cached", {
              lastChecked: cache.last_checked,
              signalsGenerated: cache.signals_generated,
              urlsChecked: cache.urls_checked,
            });
            sendSSE(controller, "complete", { signalsAdded: 0, urlsChecked: cache.urls_checked });
            controller.close();
            return;
          }
        }

        sendSSE(controller, "discovery", { message: "Discovering URLs to monitor..." });

        const { data: existingUrls } = await supabase
          .from("company_tracked_urls")
          .select("*")
          .eq("company_id", id)
          .eq("enabled", true)
          .eq("url_type", "static");

        let trackedUrls = (existingUrls ?? []) as Array<{
          id: string;
          url: string;
          label: string | null;
          last_content_hash: string | null;
        }>;

        if (trackedUrls.length === 0) {
          const discovered = await discoverUrls(company.domain, company.name, openai);
          
          // Fallback: try common URL patterns if AI found nothing
          if (discovered.length === 0) {
            console.log(`[FundWatch check-signals] AI found no URLs, trying common patterns for ${company.domain}`);
            // Only pick ONE URL per logical type to avoid duplicate signals (e.g. careers + jobs + hiring = 3x Careers)
            const patternGroups = [
              [{ path: "/careers", label: "Careers" }, { path: "/jobs", label: "Careers" }, { path: "/hiring", label: "Careers" }],
              [{ path: "/blog", label: "Blog" }, { path: "/news", label: "Blog" }],
              [{ path: "/updates", label: "Updates" }],
            ] as const;
            
            for (const group of patternGroups) {
              for (const { path, label } of group) {
                try {
                  const testUrl = `https://${company.domain}${path}`;
                  const res = await fetch(testUrl, {
                    headers: { "User-Agent": "Mozilla/5.0 (compatible; FundWatch/1.0)" },
                    signal: AbortSignal.timeout(5000),
                  });
                  if (res.ok) {
                    discovered.push({ url: testUrl, label });
                    console.log(`[FundWatch check-signals] Found valid URL: ${testUrl} (${label})`);
                    break; // Only add first successful URL per group
                  }
                } catch {
                  // Skip if URL doesn't exist
                }
              }
            }
          }
          
          sendSSE(controller, "discovery", { message: `Found ${discovered.length} URLs`, urls: discovered });
          for (const { url, label } of discovered) {
            const urlId = `tu-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            await supabase.from("company_tracked_urls").insert({
              id: urlId,
              company_id: id,
              url,
              label,
              url_type: "static",
              enabled: true,
            });
            trackedUrls.push({ id: urlId, url, label, last_content_hash: null });
          }
        } else {
          sendSSE(controller, "discovery", { message: `Using ${trackedUrls.length} saved URLs` });
        }

        // Fetch signal texts (standard + custom) - separate URLs and text patterns
        const signalTexts = await getSignalTexts(id);
        const urlSignals = signalTexts.filter((st) => st.format === "url");
        const textSignals = signalTexts.filter((st) => st.format === "text");
        
        // Add URL signals to tracked URLs if they don't exist
        for (const urlSignal of urlSignals) {
          const url = urlSignal.text.trim();
          if (!url.startsWith("http")) continue; // Skip invalid URLs
          
          const exists = trackedUrls.some((tu) => tu.url === url);
          if (!exists) {
            try {
              const urlId = `tu-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
              const label = urlSignal.text.includes("linkedin") ? "LinkedIn" : 
                          urlSignal.text.includes("blog") ? "Blog" :
                          urlSignal.text.includes("career") ? "Careers" : "Page";
              
              await supabase.from("company_tracked_urls").insert({
                id: urlId,
                company_id: id,
                url,
                label,
                url_type: "static",
                enabled: true,
              });
              trackedUrls.push({ id: urlId, url, label, last_content_hash: null });
              console.log(`[FundWatch check-signals] Added URL signal to tracked URLs: ${url}`);
            } catch (err) {
              console.error(`[FundWatch check-signals] Failed to add URL signal ${url}:`, err);
            }
          }
        }
        
        const signalTextLines = textSignals.map((st) => st.text);
        console.log(`[FundWatch check-signals] Using ${signalTextLines.length} text signals and ${urlSignals.length} URL signals`);

        let signalsAdded = 0;
        const now = new Date().toISOString();

        // Check if any signals exist for this company
        const { data: existingSignals } = await supabase
          .from("signals")
          .select("external_url")
          .eq("company_id", id)
          .limit(1);
        const hasAnySignals = (existingSignals?.length ?? 0) > 0;

        for (const tracked of trackedUrls) {
          const isFirstCheck = tracked.last_content_hash === null;
          // If no signals exist yet, treat this as first check to create baseline
          const shouldCreateBaseline = !hasAnySignals && !isFirstCheck;
          console.log(`[FundWatch check-signals] Checking ${tracked.url}, isFirstCheck: ${isFirstCheck}, shouldCreateBaseline: ${shouldCreateBaseline}, hasAnySignals: ${hasAnySignals}, last_hash: ${tracked.last_content_hash}`);
          
          // If creating baseline, pass null hash to force content fetch
          const hashToUse = shouldCreateBaseline ? null : tracked.last_content_hash;
          const isFirstRun = isFirstCheck || shouldCreateBaseline;
          
          const result = await checkUrlForChanges(tracked.url, hashToUse, controller, isFirstRun);
          console.log(`[FundWatch check-signals] Result for ${tracked.url}: changed=${result.changed}, hasContent=${!!result.content}, hash=${result.hash.slice(0, 8)}...`);
          
          // Create signal if: (1) first check, (2) content changed, or (3) creating baseline
          // If creating baseline but no content, fetch it explicitly
          if ((isFirstCheck || shouldCreateBaseline || result.changed) && result.content) {
            sendSSE(controller, "analyzing", { 
              url: tracked.url, 
              message: isFirstCheck ? "Analyzing page content..." : "Summarizing changes..." 
            });
            
            let summary: string;
            try {
              if (isFirstCheck) {
                // On first check, summarize what's currently on the page
                console.log(`[FundWatch check-signals] Summarizing initial content for ${tracked.url}`);
                summary = await summarizeInitialContent(
                  tracked.url,
                  tracked.label ?? "page",
                  result.content,
                  openai,
                  signalTextLines
                );
              } else {
                // On subsequent checks, summarize what changed
                console.log(`[FundWatch check-signals] Summarizing changes for ${tracked.url}`);
                summary = await summarizeChange(
                  tracked.url,
                  tracked.label ?? "page",
                  null,
                  result.content,
                  openai,
                  signalTextLines
                );
              }
              console.log(`[FundWatch check-signals] Generated summary for ${tracked.url}: ${summary.slice(0, 100)}...`);
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              console.error(`[FundWatch check-signals] Failed to summarize ${tracked.url}:`, msg);
              summary = `Content found on ${tracked.label ?? "page"}`;
            }
            
            const source = tracked.label === "LinkedIn" ? "LinkedIn" : tracked.label === "Blog" || tracked.label === "Updates" ? "Blog" : "Careers";
            const signalId = `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            
            try {
              const { error: insertError } = await supabase.from("signals").insert({
                id: signalId,
                company_id: id,
                source,
                timestamp: now,
                summary,
                external_url: tracked.url,
              });
              
              if (insertError) {
                console.error(`[FundWatch check-signals] Failed to insert signal for ${tracked.url}:`, insertError);
              } else {
                console.log(`[FundWatch check-signals] Successfully created signal ${signalId} for ${tracked.url}`);
                signalsAdded++;
                sendSSE(controller, "signal_created", { signal: { id: signalId, summary, source, url: tracked.url } });
              }
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              console.error(`[FundWatch check-signals] Exception inserting signal for ${tracked.url}:`, msg);
            }
          } else if (shouldCreateBaseline && !result.content) {
            // If we're creating baseline but got no content, fetch it explicitly
            console.log(`[FundWatch check-signals] Baseline creation needed but no content, fetching explicitly for ${tracked.url}`);
            try {
              const res = await fetch(tracked.url, {
                headers: { "User-Agent": "Mozilla/5.0 (compatible; FundWatch/1.0)" },
                signal: AbortSignal.timeout(10000),
              });
              if (res.ok) {
                const html = await res.text();
                const text = stripHtml(html);
                if (text.length >= 50) {
                  const summary = await summarizeInitialContent(
                    tracked.url,
                    tracked.label ?? "page",
                    text,
                    openai,
                    signalTextLines
                  );
                  const source = tracked.label === "LinkedIn" ? "LinkedIn" : tracked.label === "Blog" || tracked.label === "Updates" ? "Blog" : "Careers";
                  const signalId = `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
                  
                  const { error: insertError } = await supabase.from("signals").insert({
                    id: signalId,
                    company_id: id,
                    source,
                    timestamp: now,
                    summary,
                    external_url: tracked.url,
                  });
                  
                  if (!insertError) {
                    signalsAdded++;
                    sendSSE(controller, "signal_created", { signal: { id: signalId, summary, source, url: tracked.url } });
                    console.log(`[FundWatch check-signals] Created baseline signal for ${tracked.url}`);
                  }
                }
              }
            } catch (err) {
              console.error(`[FundWatch check-signals] Failed to create baseline signal for ${tracked.url}:`, err);
            }
          } else {
            console.log(`[FundWatch check-signals] Skipping signal creation for ${tracked.url}: changed=${result.changed}, hasContent=${!!result.content}, shouldCreateBaseline=${shouldCreateBaseline}`);
          }
          
          await supabase
            .from("company_tracked_urls")
            .update({ last_checked: now, last_content_hash: result.hash })
            .eq("id", tracked.id);
        }

        const news = await searchNews(company.name, company.domain, openai, controller);
        for (const article of news) {
          const signalId = `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          // Use the summary as-is since it already includes context from the article
          const signalSummary = article.summary || `${article.title}`;
          await supabase.from("signals").insert({
            id: signalId,
            company_id: id,
            source: "News",
            timestamp: now,
            summary: signalSummary,
            external_url: article.url,
          });
          signalsAdded++;
          sendSSE(controller, "signal_created", { signal: { id: signalId, summary: signalSummary, source: "News", url: article.url } });
        }

        await supabase.from("company_signal_cache").upsert({
          company_id: id,
          last_checked: now,
          signals_generated: signalsAdded,
          urls_checked: trackedUrls.length,
        });

        if (signalsAdded > 0) {
          await supabase.from("companies").update({ last_updated: now }).eq("id", id);
          console.log(`[FundWatch check-signals] Updated company ${id} last_updated, ${signalsAdded} signals added`);
        }

        sendSSE(controller, "complete", { signalsAdded, urlsChecked: trackedUrls.length });
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        sendSSE(controller, "error", { error: msg });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
