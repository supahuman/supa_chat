import Agent from "../../models/agentModel.js";

// Simple HTML to text stripper
function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Fetch with timeout
async function fetchWithTimeout(url, { timeoutMs = 3000 } = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return text;
  } finally {
    clearTimeout(id);
  }
}

/**
 * docsSearch - lightweight live fetch over agent KB URLs as fallback context
 * Returns top snippets and their source URLs without persisting to DB
 */
export async function docsSearch(
  agentId,
  companyId,
  query,
  { maxUrls = 2, timeoutMs = 3000 } = {}
) {
  // 1) Get agent KB URLs
  const agent = await Agent.findOne({ agentId, companyId });
  if (!agent) return { snippets: [], sources: [] };

  const terms = (query || "").toLowerCase().split(/\W+/).filter(Boolean);
  const kbItems = (agent.knowledgeBase || [])
    .filter((k) => k.type === "url" && typeof k.url === "string" && k.url)
    .map((k) => ({ url: k.url, title: (k.title || "").toLowerCase() }));

  // Score URLs by presence of query terms in title or url
  const scored = kbItems.map(({ url, title }) => {
    const lowUrl = url.toLowerCase();
    const score = terms.reduce(
      (acc, t) =>
        acc + (lowUrl.includes(t) ? 2 : 0) + (title.includes(t) ? 3 : 0),
      0
    );
    return { url, score };
  });

  // Sort by score desc, then unique
  const uniqueUrls = Array.from(
    new Set(scored.sort((a, b) => b.score - a.score).map((s) => s.url))
  ).slice(0, maxUrls);
  if (uniqueUrls.length === 0) return { snippets: [], sources: [] };

  // 2) Fetch and extract text
  const results = [];
  for (const url of uniqueUrls) {
    try {
      const html = await fetchWithTimeout(url, { timeoutMs });
      const text = stripHtml(html).slice(0, 18000); // cap per page
      results.push({ url, text });
    } catch {
      // ignore failures per URL
    }
  }

  if (results.length === 0) return { snippets: [], sources: [] };

  // 3) Naive relevance: keep paragraphs containing any query term
  const terms = (query || "").toLowerCase().split(/\W+/).filter(Boolean);
  const snippets = [];
  const sources = new Set();

  for (const { url, text } of results) {
    const paras = text.split(/(?<=\.)\s+/).slice(0, 200); // first ~200 sentences
    for (const p of paras) {
      const low = p.toLowerCase();
      if (terms.some((t) => low.includes(t))) {
        snippets.push(`Source: ${url}\n${p}`);
        sources.add(url);
        if (snippets.length >= 6) break;
      }
    }
    if (snippets.length >= 6) break;
  }

  return { snippets, sources: Array.from(sources) };
}

export default { docsSearch };
