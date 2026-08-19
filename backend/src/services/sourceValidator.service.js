// Source Extraction & Validation
//
// Prior approach explored: the Python prototype (Hiregenai/validator.py)
// did the same job by cross-checking cited URLs against a live Zenserp
// web-search result set. This Node pipeline doesn't do a separate live
// search step (the prompt is built from structured company/hiring signal/
// memory fields only) — so `allowedUrls` here is populated by the caller
// from known-good structured fields (hiring_signals.source_url,
// companies.linkedin_url) instead of search results. Same anti-hallucination
// principle, different source of truth for what counts as "real."
//
// Validation-timing decision: this runs once, here, producing an already-
// clean { status, summary, sources } object before it ever reaches
// saveValidatedResearch, which keeps its own Zod schema check too — that's
// intentional defense-in-depth (a structural gate protecting the database
// regardless of caller), not a duplicate of this function's hallucination/
// URL-sanity checks, which only make sense to run here where `allowedUrls`
// is available.

function isWellFormedUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function validateAndExtractSources(rawResult, allowedUrls = []) {
  const status = rawResult?.status;
  const summary = typeof rawResult?.summary === "string" ? rawResult.summary : "";
  const sources = Array.isArray(rawResult?.sources) ? rawResult.sources : [];

  if (status === "INSUFFICIENT_DATA") {
    throw new Error(`Research REJECTED: AI returned INSUFFICIENT_DATA — ${summary.slice(0, 200)}`);
  }
  if (status !== "SUCCESS") {
    throw new Error(`Research REJECTED: unexpected status "${status}"`);
  }

  const allowedSet = new Set(allowedUrls.filter(Boolean));
  const seen = new Set();
  const cleanSources = [];
  const hallucinated = [];

  for (const item of sources) {
    const url = typeof item?.url === "string" ? item.url.trim() : "";
    const supports = typeof item?.supports === "string" ? item.supports : "";

    if (!url || !isWellFormedUrl(url)) {
      // Empty or malformed — not usable as a citation, drop it rather than
      // reject the whole response outright.
      continue;
    }
    if (allowedSet.size > 0 && !allowedSet.has(url)) {
      hallucinated.push(url);
      continue;
    }
    if (seen.has(url)) {
      continue; // duplicate — keep the first occurrence
    }
    seen.add(url);
    cleanSources.push({ url, supports });
  }

  if (hallucinated.length > 0) {
    throw new Error(
      `Research REJECTED: sources not traceable to a known source: ${hallucinated.join(", ")}`
    );
  }

  if (cleanSources.length === 0) {
    throw new Error("Research REJECTED: zero verifiable source URLs");
  }

  return { status: "SUCCESS", summary, sources: cleanSources };
}

module.exports = {
  validateAndExtractSources,
};
