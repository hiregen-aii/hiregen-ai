const { test, describe } = require("node:test");
const assert = require("node:assert");

const {
  normalizeUrl,
  normalizeDomain,
  generateDedupeKey,
  sanitizeFormula,
  calculateConfidenceScore,
} = require("../../src/utils/dedupe");

const { serializeLeadsToCsv } = require("../../src/utils/csvExporter");
const { buildLeadsExcelWorkbook } = require("../../src/utils/excelExporter");

describe("Deduplication & Sanitization Utilities", () => {
  test("normalizeUrl should strip UTM tracking parameters and hashes", () => {
    const raw = "https://example.com/jobs/senior-dev?utm_source=linkedin&utm_medium=cpc&ref=xyz#apply";
    const clean = normalizeUrl(raw);
    assert.strictEqual(clean, "https://example.com/jobs/senior-dev");
  });

  test("normalizeDomain should extract clean domains", () => {
    assert.strictEqual(normalizeDomain("Stripe Inc", "https://www.stripe.com/careers"), "stripe.com");
    assert.strictEqual(normalizeDomain("Razorpay", null), "razorpay.com");
  });

  test("generateDedupeKey should produce consistent SHA-256 hashes", () => {
    const hash1 = generateDedupeKey("stripe.com", "DevOps Engineer", "https://stripe.com/jobs/123");
    const hash2 = generateDedupeKey("STRIPE.COM  ", "devops engineer", "https://stripe.com/jobs/123/");
    assert.strictEqual(hash1, hash2);
    assert.strictEqual(hash1.length, 64); // SHA-256 hex length
  });

  test("sanitizeFormula should escape dangerous spreadsheet formula injection characters", () => {
    assert.strictEqual(sanitizeFormula("=SUM(A1:B1)"), "'=SUM(A1:B1)");
    assert.strictEqual(sanitizeFormula("+123456"), "'+123456");
    assert.strictEqual(sanitizeFormula("-2+5*cmd"), "'-2+5*cmd");
    assert.strictEqual(sanitizeFormula("@echo"), "'@echo");
    assert.strictEqual(sanitizeFormula("Normal Company Name"), "Normal Company Name");
  });

  test("calculateConfidenceScore should score high for complete data", () => {
    const score = calculateConfidenceScore({
      website: "company.com",
      contact_email: "talent@company.com",
      contact_verified: true,
      industry: "FinTech",
    });
    assert.strictEqual(score, 100);
  });
});

describe("CSV & Excel Exporters", () => {
  const sampleLeads = [
    {
      company_name: "Stripe",
      website: "stripe.com",
      industry: "FinTech",
      size_range: "500-1000 employees",
      role_title: "Staff SRE",
      hiring_type: "FULL_TIME",
      location: "Remote",
      source_url: "https://stripe.com/jobs",
      contact_name: "Sarah Jenkins",
      contact_title: "Head of Talent",
      contact_email: "talent@stripe.com",
      contact_verified: true,
      fit_score: 95,
      lead_stage: "NEW",
      detected_at: new Date().toISOString(),
    },
  ];

  test("serializeLeadsToCsv should produce valid CSV with UTF-8 BOM", () => {
    const csv = serializeLeadsToCsv(sampleLeads);
    assert.ok(csv.startsWith("\uFEFF"));
    assert.ok(csv.includes("Company Name,Website,Industry"));
    assert.ok(csv.includes("Stripe"));
    assert.ok(csv.includes("Staff SRE"));
  });

  test("buildLeadsExcelWorkbook should construct an Excel workbook with styled sheet", async () => {
    const workbook = await buildLeadsExcelWorkbook(sampleLeads);
    const sheet = workbook.getWorksheet("Verified Leads");
    assert.ok(sheet);
    assert.strictEqual(sheet.columns.length, 16);
    assert.strictEqual(sheet.getRow(1).getCell(1).value, "Company Name");
    assert.strictEqual(sheet.getRow(2).getCell(1).value, "Stripe");
  });
});

describe("Multi-Platform Scraper & Industry Inference", () => {
  const { inferIndustry, fetchJobicyJobs, fetchWeWorkRemotelyJobs } = require("../../src/services/scraper.service");

  test("inferIndustry should classify tech categories accurately", () => {
    assert.strictEqual(inferIndustry("Senior AI Research Scientist", "", ["llm", "python"]), "Artificial Intelligence & Data Systems");
    assert.strictEqual(inferIndustry("Lead DevOps Engineer", "", ["kubernetes", "aws"]), "Cloud Infrastructure & DevOps");
    assert.strictEqual(inferIndustry("Payment Gateway Developer", "", ["fintech", "banking"]), "FinTech & Payment Solutions");
    assert.strictEqual(inferIndustry("Clinical Trials Coordinator", "", ["health"]), "HealthTech & Life Sciences");
  });

  test("scraper service exports live multi-platform fetchers", () => {
    assert.strictEqual(typeof fetchJobicyJobs, "function");
    assert.strictEqual(typeof fetchWeWorkRemotelyJobs, "function");
  });
});

