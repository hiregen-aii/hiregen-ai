const crypto = require("crypto");

/**
 * Normalizes a URL by stripping tracking parameters, hashes, and trailing slashes.
 */
function normalizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  try {
    const parsed = new URL(rawUrl.trim());
    // Strip common marketing and session tracking params
    const trackingPrefixes = ["utm_", "ref", "fbclid", "gclid", "mc_cid", "mc_eid", "source", "gh_src"];
    for (const key of Array.from(parsed.searchParams.keys())) {
      if (trackingPrefixes.some((p) => key.toLowerCase().startsWith(p))) {
        parsed.searchParams.delete(key);
      }
    }
    parsed.hash = "";
    let clean = parsed.toString().replace(/\/+$/, "");
    return clean;
  } catch {
    // If URL parsing fails, perform regex cleanup
    return rawUrl
      .trim()
      .split("?")[0]
      .replace(/\/+$/, "");
  }
}

/**
 * Normalizes or infers a company domain.
 */
function normalizeDomain(companyName, rawDomain) {
  if (rawDomain && typeof rawDomain === "string" && rawDomain.trim()) {
    let d = rawDomain.trim().toLowerCase();
    d = d.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0];
    if (d.includes(".")) return d;
  }
  const cleanName = (companyName || "company")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return (cleanName || "company") + ".com";
}

/**
 * Generates an idempotent SHA-256 fingerprint for hiring signals.
 * Canonical format: domain|role_title|clean_url
 */
function generateDedupeKey(domain, roleTitle, cleanUrl) {
  const cDomain = normalizeDomain("", domain);
  const cRole = (roleTitle || "").toLowerCase().trim();
  const cUrl = normalizeUrl(cleanUrl).toLowerCase().trim();
  const payload = `${cDomain}|${cRole}|${cUrl}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

/**
 * Sanitizes cell strings to prevent CSV Formula Injection attacks in Microsoft Excel.
 * Prefixes cells starting with '=', '+', '-', '@', '\t', '\r' with a single quote.
 */
function sanitizeFormula(val) {
  if (val === null || val === undefined) return "";
  const str = String(val).trim();
  if (!str) return "";
  const dangerousChars = ["=", "+", "-", "@", "\t", "\r"];
  if (dangerousChars.includes(str[0])) {
    return `'${str}`;
  }
  return str;
}

/**
 * Calculates a Data Confidence Score (0-100%) indicating lead hygiene and completeness.
 */
function calculateConfidenceScore(item = {}) {
  let score = 70;
  if (item.website && item.website.includes(".")) score += 10;
  if (item.contact_email && item.contact_email.includes("@")) score += 10;
  if (item.contact_verified) score += 5;
  if (item.industry && item.industry !== "General") score += 5;
  return Math.min(score, 100);
}

module.exports = {
  normalizeUrl,
  normalizeDomain,
  generateDedupeKey,
  sanitizeFormula,
  calculateConfidenceScore,
};
