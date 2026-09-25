/**
 * URL import (PROMPT.md Section 3): a stateless fetch-and-extract step.
 * Fetches a public page, extracts the main article text with Readability,
 * and returns editable text plus the title and publication date when the
 * page exposes them. Nothing is stored. Logging is the caller's job and is
 * limited to the domain and a status code.
 */
import { Readability } from "@mozilla/readability";
import { JSDOM, VirtualConsole } from "jsdom";
import type { CommunicationFormat } from "../engine/types.js";

export const IMPORT_ERROR = "Couldn't extract readable text from this page. Paste the text instead.";

export interface ImportedPage {
  source_url: string;
  title: string | null;
  published: string | null;
  text: string;
  suggested_format: CommunicationFormat | null;
}

/** Only public http(s) URLs without credentials; loopback, link-local and private ranges are refused. */
export function allowedUrl(input: string): URL | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host === "0.0.0.0") return null;
  if (/^\[?::1\]?$/.test(host) || host.startsWith("[fc") || host.startsWith("[fd") || host.startsWith("[fe80")) return null;
  const v4 = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(host);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    if (a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) {
      return null;
    }
  }
  return url;
}

/** A newsroom or press URL suggests a press release; a blog URL suggests a leader message. */
export function suggestFormatFromUrl(url: string): CommunicationFormat | null {
  if (/newsroom|press[-_]?release|\/press(\/|$)|\/news(\/|$)|\/media(\/|$)|\/announcements?(\/|$)/i.test(url)) return "Press release or public statement";
  if (/\/blogs?(\/|$)|\/posts?(\/|$)|blog\./i.test(url)) return "Leader message";
  return null;
}

const MIN_WORDS = 40;

function normalize(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t ]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function publishedFrom(doc: Document, fromReadability: string | null | undefined): string | null {
  if (fromReadability) return fromReadability;
  const selectors = [
    'meta[property="article:published_time"]',
    'meta[name="article:published_time"]',
    'meta[name="pubdate"]',
    'meta[name="publish-date"]',
    'meta[name="date"]',
    'meta[itemprop="datePublished"]',
    'meta[name="DC.date.issued"]',
  ];
  for (const sel of selectors) {
    const v = doc.querySelector(sel)?.getAttribute("content")?.trim();
    if (v) return v;
  }
  const time = doc.querySelector("time[datetime]")?.getAttribute("datetime")?.trim();
  return time || null;
}

/** Returns null when the page has no readable article body (paywall, login wall, script-only page). */
export function extractReadable(html: string, url: string): ImportedPage | null {
  const virtualConsole = new VirtualConsole(); // swallow CSS/JS parse noise; never log page content
  const dom = new JSDOM(html, { url, virtualConsole });
  const doc = dom.window.document;
  // Readability rewrites the document while parsing; read the heading first.
  const heading = doc.querySelector("article h1, main h1, h1")?.textContent?.trim() ?? "";
  let article: ReturnType<Readability["parse"]> = null;
  try {
    article = new Readability(doc, { charThreshold: 200 }).parse();
  } catch {
    article = null;
  }
  const text = normalize(article?.textContent ?? "");
  const words = text.split(/\s+/).filter(Boolean).length;
  if (!article || words < MIN_WORDS) return null;
  // Prefer the article's own heading when the document title carries a site-name suffix.
  const docTitle = (article.title ?? doc.title ?? "").trim();
  const title = (heading && docTitle.includes(heading) ? heading : docTitle) || null;
  return {
    source_url: url,
    title,
    published: publishedFrom(doc, article.publishedTime),
    text,
    suggested_format: suggestFormatFromUrl(url),
  };
}

export interface FetchedPage {
  status: number;
  contentType: string;
  html: string;
  finalUrl: string;
}

export interface FetchOptions {
  timeoutMs?: number;
  maxBytes?: number;
  fetchImpl?: typeof fetch;
}

/** Fetches one page with a timeout and a size cap. Non-HTML responses come back with empty html. */
export async function fetchPage(url: URL, options: FetchOptions = {}): Promise<FetchedPage> {
  const { timeoutMs = 15_000, maxBytes = 3_000_000, fetchImpl = fetch } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent": "AccountableCommunicationsReview/0.1 (+import; stateless fetch)",
        accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
      },
    });
    const contentType = res.headers.get("content-type") ?? "";
    const finalUrl = res.url || url.toString();
    if (!/text\/html|application\/xhtml\+xml/i.test(contentType) || !res.body) {
      return { status: res.status, contentType, html: "", finalUrl };
    }
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > maxBytes) {
        await reader.cancel();
        break;
      }
      chunks.push(value);
    }
    const html = Buffer.concat(chunks).toString("utf8");
    return { status: res.status, contentType, html, finalUrl };
  } finally {
    clearTimeout(timer);
  }
}
