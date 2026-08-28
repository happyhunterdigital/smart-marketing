// functions/src/services/auditService.ts
import axios from "axios";
import { load } from "cheerio";
import { callDeepSeek } from "./deepseekService";
import { PAGESPEED_API_KEY } from "../config";

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export interface ScrapedSiteData {
  title: string;
  description: string;
  viewport: string;
  schemas: string[];
  bodyText: string;
  // Enhanced fields
  canonical: string;
  ogTags: Record<string, string>;
  twitterCard: Record<string, string>;
  robotsMeta: string;
  headingHierarchy: { h1: string[]; h2: string[]; h3: string[] };
  internalLinks: number;
  externalLinks: number;
  hasLlmsTxt: boolean;
  imageCount: number;
  imagesWithoutAlt: number;
}

export interface SecuritySignals {
  hasSSL: boolean;
  sslRedirect: boolean;
  headers: {
    strictTransportSecurity: boolean;
    xContentTypeOptions: boolean;
    xFrameOptions: boolean;
    contentSecurityPolicy: boolean;
  };
  securityScore: number;
}

export interface PerformanceSignals {
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  coreWebVitals: {
    lcp: number;
    cls: number;
    inp: number;
  };
  mobileUsability: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
};

const PSI_API_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

// ─────────────────────────────────────────────────────────────────────────────
// PILLAR 1: PERFORMANCE & CORE WEB VITALS (via Google PageSpeed Insights API)
// ─────────────────────────────────────────────────────────────────────────────

export const getPerformanceSignals = async (url: string): Promise<PerformanceSignals> => {
  const fallback: PerformanceSignals = {
    performanceScore: -1,
    seoScore: -1,
    accessibilityScore: -1,
    bestPracticesScore: -1,
    coreWebVitals: { lcp: -1, cls: -1, inp: -1 },
    mobileUsability: "UNAVAILABLE"
  };

  try {
    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    // Build multi-category PSI URL for mobile strategy
    const psiUrl = `${PSI_API_URL}?url=${encodeURIComponent(targetUrl)}&strategy=mobile&category=performance&category=seo&category=accessibility&category=best-practices${PAGESPEED_API_KEY ? `&key=${PAGESPEED_API_KEY}` : ""}`;

    const response = await axios.get(psiUrl, { timeout: 30000 });
    const data = response.data;

    const categories = data?.lighthouseResult?.categories || {};
    const audits = data?.lighthouseResult?.audits || {};

    // Extract Lighthouse category scores (0-1 range, convert to 0-100)
    const performanceScore = Math.round((categories?.performance?.score ?? -0.01) * 100);
    const seoScore = Math.round((categories?.seo?.score ?? -0.01) * 100);
    const accessibilityScore = Math.round((categories?.accessibility?.score ?? -0.01) * 100);
    const bestPracticesScore = Math.round((categories?.["best-practices"]?.score ?? -0.01) * 100);

    // Extract Core Web Vitals from audits
    const lcp = audits?.["largest-contentful-paint"]?.numericValue ?? -1;
    const cls = audits?.["cumulative-layout-shift"]?.numericValue ?? -1;
    const inp = audits?.["interaction-to-next-paint"]?.numericValue ??
                audits?.["total-blocking-time"]?.numericValue ?? -1;

    // Mobile usability from field data if available
    const loadingExperience = data?.loadingExperience?.overall_category || "UNAVAILABLE";

    return {
      performanceScore: performanceScore >= 0 ? performanceScore : -1,
      seoScore: seoScore >= 0 ? seoScore : -1,
      accessibilityScore: accessibilityScore >= 0 ? accessibilityScore : -1,
      bestPracticesScore: bestPracticesScore >= 0 ? bestPracticesScore : -1,
      coreWebVitals: {
        lcp: lcp >= 0 ? parseFloat((lcp / 1000).toFixed(2)) : -1, // Convert ms to seconds
        cls: cls >= 0 ? parseFloat(cls.toFixed(3)) : -1,
        inp: inp >= 0 ? Math.round(inp) : -1 // Keep in ms
      },
      mobileUsability: loadingExperience
    };
  } catch (err: any) {
    console.warn(`[getPerformanceSignals] PSI API failed: ${err.message}`);
    return fallback;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PILLAR 2: SSL & SECURITY HEADERS
// ─────────────────────────────────────────────────────────────────────────────

export const checkSecurityHeaders = async (url: string): Promise<SecuritySignals> => {
  const result: SecuritySignals = {
    hasSSL: false,
    sslRedirect: false,
    headers: {
      strictTransportSecurity: false,
      xContentTypeOptions: false,
      xFrameOptions: false,
      contentSecurityPolicy: false
    },
    securityScore: 0
  };

  try {
    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    // Check HTTPS
    const httpsUrl = targetUrl.replace(/^http:\/\//i, "https://");
    const response = await axios.get(httpsUrl, {
      timeout: 8000,
      headers: DEFAULT_HEADERS,
      maxRedirects: 5,
      validateStatus: () => true // Accept any status to read headers
    });

    result.hasSSL = httpsUrl.startsWith("https://") && response.status < 500;

    // Check headers (normalize to lowercase)
    const headers = response.headers || {};
    const headerKeys = Object.keys(headers).reduce((acc, k) => {
      acc[k.toLowerCase()] = headers[k];
      return acc;
    }, {} as Record<string, any>);

    result.headers.strictTransportSecurity = !!headerKeys["strict-transport-security"];
    result.headers.xContentTypeOptions = !!headerKeys["x-content-type-options"];
    result.headers.xFrameOptions = !!headerKeys["x-frame-options"];
    result.headers.contentSecurityPolicy = !!headerKeys["content-security-policy"];

    // Check HTTP → HTTPS redirect
    try {
      const httpUrl = targetUrl.replace(/^https:\/\//i, "http://");
      const httpResponse = await axios.get(httpUrl, {
        timeout: 5000,
        headers: DEFAULT_HEADERS,
        maxRedirects: 0,
        validateStatus: () => true
      });
      // 301/302/307/308 redirect to HTTPS = good
      const location = httpResponse.headers?.location || "";
      result.sslRedirect = (httpResponse.status >= 300 && httpResponse.status < 400 && location.startsWith("https://"));
    } catch {
      // Connection refused on HTTP = likely HTTPS-only (good)
      result.sslRedirect = true;
    }

    // Calculate security score
    let score = 0;
    if (result.hasSSL) score += 30;
    if (result.sslRedirect) score += 20;
    if (result.headers.strictTransportSecurity) score += 15;
    if (result.headers.xContentTypeOptions) score += 10;
    if (result.headers.xFrameOptions) score += 10;
    if (result.headers.contentSecurityPolicy) score += 15;
    result.securityScore = score;

  } catch (err: any) {
    console.warn(`[checkSecurityHeaders] Security check failed: ${err.message}`);
  }

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// PILLAR 3 & 4 & 7: ENHANCED WEBSITE SCRAPING (SEO + Schema + Social Signals)
// ─────────────────────────────────────────────────────────────────────────────

// Helper to parse Jina Reader markdown output (fallback)
const parseJinaMarkdown = (markdown: string): ScrapedSiteData => {
  let title = "";
  const titleMatch = markdown.match(/^Title:\s*(.*)$/im) || markdown.match(/^#\s*(.*)$/m);
  if (titleMatch) title = titleMatch[1].trim();

  let description = "";
  const descMatch = markdown.match(/^Description:\s*(.*)$/im);
  if (descMatch) description = descMatch[1].trim();

  return {
    title: title || "Scraped Website",
    description: description || "No description provided.",
    viewport: "width=device-width, initial-scale=1.0",
    schemas: ["WebPage"],
    bodyText: markdown.slice(0, 5000),
    canonical: "",
    ogTags: {},
    twitterCard: {},
    robotsMeta: "",
    headingHierarchy: { h1: [], h2: [], h3: [] },
    internalLinks: 0,
    externalLinks: 0,
    hasLlmsTxt: false,
    imageCount: 0,
    imagesWithoutAlt: 0
  };
};

export const scrapeWebsiteText = async (url: string): Promise<ScrapedSiteData> => {
  let targetUrl = url.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `https://${targetUrl}`;
  }

  try {
    const response = await axios.get(targetUrl, {
      timeout: 10000,
      headers: DEFAULT_HEADERS,
      maxRedirects: 5
    });

    const html = response.data;
    if (typeof html !== "string") {
      throw new Error("Invalid response content type");
    }

    const $ = load(html);

    // ── SEO META ──
    const title = $("title").text() || $("meta[property='og:title']").attr("content") || "";
    const description = $("meta[name='description']").attr("content") || $("meta[property='og:description']").attr("content") || "";
    const viewport = $("meta[name='viewport']").attr("content") || "";
    const canonical = $("link[rel='canonical']").attr("href") || "";
    const robotsMeta = $("meta[name='robots']").attr("content") || "";

    // ── SCHEMA MARKUP ──
    const schemas: string[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || "{}");
        const extract = (obj: any) => {
          if (!obj) return;
          if (Array.isArray(obj)) obj.forEach(extract);
          else if (obj['@type']) schemas.push(obj['@type']);
        };
        extract(json);
      } catch (e) {}
    });
    const uniqueSchemas = [...new Set(schemas)];

    // ── OPEN GRAPH TAGS ──
    const ogTags: Record<string, string> = {};
    $("meta[property^='og:']").each((_, el) => {
      const prop = $(el).attr("property")?.replace("og:", "") || "";
      const content = $(el).attr("content") || "";
      if (prop && content) ogTags[prop] = content;
    });

    // ── TWITTER CARD ──
    const twitterCard: Record<string, string> = {};
    $("meta[name^='twitter:']").each((_, el) => {
      const name = $(el).attr("name")?.replace("twitter:", "") || "";
      const content = $(el).attr("content") || "";
      if (name && content) twitterCard[name] = content;
    });

    // ── HEADING HIERARCHY ──
    const headingHierarchy = {
      h1: $("h1").map((_, el) => $(el).text().trim()).get().slice(0, 5),
      h2: $("h2").map((_, el) => $(el).text().trim()).get().slice(0, 10),
      h3: $("h3").map((_, el) => $(el).text().trim()).get().slice(0, 10)
    };

    // ── LINK ANALYSIS ──
    let hostname = "";
    try {
      hostname = new URL(targetUrl).hostname;
    } catch {}

    let internalLinks = 0;
    let externalLinks = 0;
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") || "";
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (href.startsWith("/") || href.includes(hostname)) {
        internalLinks++;
      } else if (href.startsWith("http")) {
        externalLinks++;
      }
    });

    // ── IMAGE ACCESSIBILITY ──
    const imageCount = $("img").length;
    let imagesWithoutAlt = 0;
    $("img").each((_, el) => {
      const alt = $(el).attr("alt");
      if (!alt || alt.trim() === "") imagesWithoutAlt++;
    });

    // ── CLEAN BODY TEXT ──
    $("script, style, iframe, noscript, svg, header, footer, nav").remove();
    const bodyText = $("body").text() || $("html").text() || "";
    const cleanText = bodyText
      .replace(/\s+/g, " ")
      .replace(/\n+/g, " ")
      .trim()
      .slice(0, 5000);

    return {
      title: title.trim(),
      description: description.trim(),
      viewport: viewport.trim(),
      schemas: uniqueSchemas,
      bodyText: cleanText,
      canonical,
      ogTags,
      twitterCard,
      robotsMeta,
      headingHierarchy,
      internalLinks,
      externalLinks,
      hasLlmsTxt: false, // Set separately by checkLlmsTxt()
      imageCount,
      imagesWithoutAlt
    };
  } catch (err: any) {
    console.warn(`[scrapeWebsiteText] Primary scrape failed for ${targetUrl}: ${err.message}. Retrying via Jina Reader...`);
    try {
      const jinaUrl = `https://r.jina.ai/${targetUrl}`;
      const jinaResponse = await axios.get(jinaUrl, {
        timeout: 12000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      const markdown = jinaResponse.data;
      if (typeof markdown === "string" && markdown.trim().length > 0) {
        console.log(`[scrapeWebsiteText] Jina Reader fallback success for ${targetUrl}`);
        return parseJinaMarkdown(markdown);
      }
      throw new Error("Jina returned empty response");
    } catch (jinaErr: any) {
      console.error(`[scrapeWebsiteText] Jina fallback also failed for ${targetUrl}:`, jinaErr.message);
      throw new Error(`Website unreachable (scrapers blocked): ${err.message}. Please check the URL.`);
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PILLAR 4 (continued): AEO READINESS — llms.txt check
// ─────────────────────────────────────────────────────────────────────────────

export const checkLlmsTxt = async (url: string): Promise<boolean> => {
  try {
    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }
    const origin = new URL(targetUrl).origin;
    const llmsUrl = `${origin}/llms.txt`;
    const response = await axios.get(llmsUrl, {
      timeout: 5000,
      headers: DEFAULT_HEADERS,
      validateStatus: (status) => status === 200
    });
    return typeof response.data === "string" && response.data.trim().length > 10;
  } catch {
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA-ONLY SCRAPER (legacy compat)
// ─────────────────────────────────────────────────────────────────────────────

export const scrapeWebsiteSchema = async (url: string) => {
  try {
    const webRes = await axios.get(url, {
      timeout: 8000,
      headers: DEFAULT_HEADERS,
      maxRedirects: 5
    });
    const $ = load(webRes.data);
    let detected: string[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || "{}");
        const extract = (obj: any) => {
          if (!obj) return;
          if (Array.isArray(obj)) obj.forEach(extract);
          else if (obj['@type']) detected.push(obj['@type']);
        };
        extract(json);
      } catch (e) {}
    });
    return [...new Set(detected)];
  } catch (err) {
    console.error("Schema scraping failed:", (err as any).message);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// AI AUDIT CALLER
// ─────────────────────────────────────────────────────────────────────────────

export const callDeepSeekAudit = async (prompt: string) => {
  const jsonString = await callDeepSeek(
    [
      {
        role: "system",
        content: "You are Hunter AI, a ruthless digital marketing auditor. Output only valid JSON matching the requested schema. No extra text, no markdown fences.",
      },
      { role: "user", content: prompt },
    ],
    { jsonMode: true, temperature: 0.0, maxRetries: 2 }
  );

  try {
    return JSON.parse(jsonString);
  } catch (parseError: any) {
    console.error("[callDeepSeekAudit] DeepSeek returned invalid JSON:", jsonString, parseError.message);
    // Safe self-healing fallback scorecard
    return {
      score: 30,
      summary: "AI systems could not securely synthesize this business's digital footprint. An authority framework is required to verify their entity profile for search engines.",
      truths: [
        "Performance & Core Web Vitals: Analysis unavailable",
        "SSL & Security: Analysis unavailable",
        "SEO Meta & Content: Analysis unavailable",
        "Schema & AEO Readiness: Analysis unavailable",
        "Mobile Responsiveness: Analysis unavailable",
        "Google Business Profile: Analysis unavailable",
        "Social Proof & Entity Signals: Analysis unavailable"
      ]
    };
  }
};
