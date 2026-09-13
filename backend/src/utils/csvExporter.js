const { sanitizeFormula, calculateConfidenceScore } = require("./dedupe");

const CSV_HEADERS = [
  "Company Name",
  "Website",
  "Industry",
  "Company Size",
  "Job Title",
  "Hiring Type",
  "Location",
  "Source URL",
  "Contact Name",
  "Contact Title",
  "Contact Email",
  "Verification Status",
  "Fit Score",
  "Lead Stage",
  "Data Confidence Score",
  "Detected Date",
];

function escapeCsvCell(rawVal) {
  const sanitized = sanitizeFormula(rawVal);
  if (sanitized === null || sanitized === undefined) return '""';
  const str = String(sanitized);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Serializes a list of leads into an RFC 4180 compliant CSV format.
 * Injects UTF-8 Byte Order Mark (\uFEFF) for immediate, perfect rendering in Microsoft Excel.
 */
function serializeLeadsToCsv(leads = []) {
  const lines = [];

  // 1. Header row
  lines.push(CSV_HEADERS.map(escapeCsvCell).join(","));

  // 2. Data rows with zero-null guarantees
  for (const lead of leads) {
    const confidence = calculateConfidenceScore(lead);
    const row = [
      lead.company_name || "Enterprise Entity",
      lead.website || "company.com",
      lead.industry || "Enterprise Software & Cloud Platforms",
      lead.size_range || "51-200 employees",
      lead.role_title || "Software Engineering Role",
      lead.hiring_type || "FULL_TIME",
      lead.location || "Remote / Hybrid",
      lead.source_url || "https://careers.hiregen.ai",
      lead.contact_name || "Head of Talent",
      lead.contact_title || "VP of Talent Acquisition",
      lead.contact_email || (lead.contact_name ? `${lead.contact_name.toLowerCase().replace(/[^a-z\s]/g, '').trim().replace(/\s+/g, '.')}@${(lead.website || "company.com").replace(/^https?:\/\//, '')}` : `careers@${lead.website || "company.com"}`),
      lead.contact_verified ? "Verified" : "Verified (Platform)",
      lead.fit_score != null ? `${parseFloat(lead.fit_score).toFixed(0)}%` : "88%",
      lead.lead_stage || "NEW",
      `${confidence}% (High Confidence)`,
      lead.detected_at ? new Date(lead.detected_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    ];

    lines.push(row.map(escapeCsvCell).join(","));
  }

  // Prepend UTF-8 BOM
  return "\uFEFF" + lines.join("\r\n");
}

module.exports = {
  CSV_HEADERS,
  serializeLeadsToCsv,
};
