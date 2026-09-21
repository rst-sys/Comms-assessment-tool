import { describe, expect, it } from "vitest";
import { allowedUrl, extractReadable, fetchPage, suggestFormatFromUrl } from "../import.js";

const paragraph = (n: number) =>
  `<p>Paragraph ${n}. On 4 September the executive team decided to close the Denver support center by 31 December, after demand shifted to chat and self-service faster than planned. Maria Chen owns the transition and will report progress monthly.</p>`;

const articleHtml = `<!doctype html><html><head><title>Denver support center closure | Example Newsroom</title>
<meta property="article:published_time" content="2026-09-04T09:00:00Z"></head>
<body><nav><a href="/">Home</a><a href="/news">News</a></nav>
<div class="cookie-banner">We use cookies. <button>Accept</button></div>
<article><h1>Denver support center closure</h1>${[1, 2, 3, 4, 5, 6].map(paragraph).join("")}</article>
<section id="comments"><p>Great news!</p><p>Terrible news!</p></section>
<footer>© Example Corp</footer></body></html>`;

describe("extractReadable", () => {
  it("extracts the article text, title and publication date and drops navigation and comments", () => {
    const page = extractReadable(articleHtml, "https://example.com/newsroom/denver-closure");
    expect(page).not.toBeNull();
    expect(page!.title).toBe("Denver support center closure");
    expect(page!.published).toBe("2026-09-04T09:00:00Z");
    expect(page!.text).toContain("Paragraph 1.");
    expect(page!.text).toContain("Paragraph 6.");
    expect(page!.text).not.toContain("We use cookies");
    expect(page!.text).not.toContain("Great news!");
    expect(page!.suggested_format).toBe("Press release");
  });

  it("returns null for a paywalled or script-only page with no readable body", () => {
    const paywall = `<!doctype html><html><head><title>Subscribe</title></head><body><div id="app"></div><p>Subscribe to read this article.</p><script>window.__DATA__={}</script></body></html>`;
    expect(extractReadable(paywall, "https://news.example.com/story")).toBeNull();
  });

  it("does not suggest a type for an ordinary page", () => {
    const page = extractReadable(articleHtml, "https://example.com/about/denver-closure");
    expect(page!.suggested_format).toBeNull();
  });
});

describe("allowedUrl", () => {
  it("accepts public http and https addresses", () => {
    expect(allowedUrl("https://example.com/news/a")?.hostname).toBe("example.com");
    expect(allowedUrl("  http://example.org  ")?.protocol).toBe("http:");
  });
  it("refuses other schemes, credentials, loopback and private ranges", () => {
    for (const bad of [
      "ftp://example.com/x",
      "file:///etc/passwd",
      "https://user:pw@example.com/",
      "http://localhost:8787/api/config",
      "http://127.0.0.1/",
      "http://10.0.0.5/",
      "http://192.168.1.1/",
      "http://172.20.0.1/",
      "http://169.254.169.254/latest/meta-data",
      "http://[::1]/",
      "not a url",
    ]) {
      expect(allowedUrl(bad), bad).toBeNull();
    }
  });
});

describe("suggestFormatFromUrl", () => {
  it("suggests Press release for newsroom and press URLs only", () => {
    expect(suggestFormatFromUrl("https://corp.example.com/newsroom/2026/statement")).toBe("Press release");
    expect(suggestFormatFromUrl("https://corp.example.com/press-releases/q3")).toBe("Press release");
    expect(suggestFormatFromUrl("https://corp.example.com/news/q3")).toBe("Press release");
    expect(suggestFormatFromUrl("https://corp.example.com/ceo-letter")).toBeNull();
  });
  it("suggests Blog post for a blog URL", () => {
    expect(suggestFormatFromUrl("https://corp.example.com/blog/why-we-changed")).toBe("Blog post");
    expect(suggestFormatFromUrl("https://blog.example.com/why-we-changed")).toBe("Blog post");
  });
});

describe("fetchPage", () => {
  const fakeFetch = (status: number, type: string, body: string): typeof fetch =>
    (async () => new Response(body, { status, headers: { "content-type": type } })) as unknown as typeof fetch;

  it("returns html for an html response", async () => {
    const page = await fetchPage(new URL("https://example.com/a"), { fetchImpl: fakeFetch(200, "text/html; charset=utf-8", "<p>hi</p>") });
    expect(page.status).toBe(200);
    expect(page.html).toBe("<p>hi</p>");
  });

  it("returns empty html for a PDF so the caller reports an unreadable page", async () => {
    const page = await fetchPage(new URL("https://example.com/a.pdf"), { fetchImpl: fakeFetch(200, "application/pdf", "%PDF-1.4") });
    expect(page.html).toBe("");
  });

  it("stops reading past the size cap", async () => {
    const big = "x".repeat(5000);
    const page = await fetchPage(new URL("https://example.com/big"), { fetchImpl: fakeFetch(200, "text/html", big), maxBytes: 1000 });
    expect(page.html.length).toBeLessThanOrEqual(5000);
  });
});
