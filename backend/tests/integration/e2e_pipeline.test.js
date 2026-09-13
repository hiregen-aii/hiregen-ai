const { test, describe, after } = require("node:test");
const assert = require("node:assert");
const pool = require("../../src/config/db");
const { scrapeHiringSignals } = require("../../src/services/scraper.service");
const { serializeLeadsToCsv } = require("../../src/utils/csvExporter");
const { buildLeadsExcelWorkbook } = require("../../src/utils/excelExporter");

describe("E2E Scraping, Zero-Null Ingestion, Deduplication & Export Pipeline", () => {
  after(async () => {
    // Graceful close of db connections
    await pool.close();
  });

  test("Step 1: Multi-platform scraper fetches live data and populates DB with Zero-Null values", async () => {
    // Run live scrape targeting 'engineer'
    const scrapeResult = await scrapeHiringSignals({
      query: "engineer",
      location: "Remote",
      hiringType: "FULL_TIME",
    });

    console.log("Scrape run 1 stats:", scrapeResult);
    assert.ok(scrapeResult.totalFound > 0, "Should have found at least 1 job posting across platforms");
    assert.ok(scrapeResult.newlyAdded > 0 || scrapeResult.duplicatesSkipped > 0, "Should have processed jobs");

    // Verify DB records for zero-null guarantee
    const dbCheck = await pool.query(`
      SELECT 
        l.id AS lead_id,
        c.name AS company_name,
        c.domain,
        c.industry,
        c.size_range,
        co.full_name AS contact_name,
        co.email AS contact_email,
        co.title AS contact_title,
        co.verified AS contact_verified,
        hs.role_title,
        hs.source,
        hs.source_url,
        hs.dedupe_key,
        l.fit_score,
        l.stage,
        l.hiring_type
      FROM leads l
      JOIN companies c ON l.company_id = c.id
      JOIN contacts co ON l.primary_contact_id = co.id
      JOIN hiring_signals hs ON l.hiring_signal_id = hs.id
      ORDER BY l.created_at DESC
      LIMIT 10;
    `);

    assert.ok(dbCheck.rows.length > 0, "Database should contain lead rows");

    // Strict Zero-Null Guarantee assertion across every single column
    for (const row of dbCheck.rows) {
      assert.ok(row.lead_id, "lead_id must not be null");
      assert.ok(row.company_name, "company_name must not be null");
      assert.ok(row.domain, "domain must not be null");
      assert.ok(row.industry, "industry must not be null");
      assert.ok(row.size_range, "size_range must not be null");
      assert.ok(row.contact_name, "contact_name must not be null");
      assert.ok(row.contact_email, "contact_email must not be null");
      assert.ok(row.contact_title, "contact_title must not be null");
      assert.strictEqual(typeof row.contact_verified, "boolean", "contact_verified must be boolean");
      assert.ok(row.role_title, "role_title must not be null");
      assert.ok(row.source, "source must not be null");
      assert.ok(row.source_url, "source_url must not be null");
      assert.strictEqual(row.dedupe_key.length, 64, "dedupe_key must be a 64-character SHA-256 hash");
      assert.ok(row.fit_score >= 0, "fit_score must be a valid number");
      assert.ok(row.stage, "stage must not be null");
      assert.ok(row.hiring_type, "hiring_type must not be null");
    }
  });

  test("Step 2: SHA-256 Deduplication prevents redundant rows on re-scrape", async () => {
    // Run second scrape with exact same query to test idempotency
    const secondRun = await scrapeHiringSignals({
      query: "engineer",
      location: "Remote",
      hiringType: "FULL_TIME",
    });

    console.log("Scrape run 2 stats:", secondRun);
    assert.ok(
      secondRun.duplicatesSkipped > 0,
      "Second run must detect and skip existing jobs via SHA-256 deduplication"
    );
  });

  test("Step 3: Export Engine produces valid RFC 4180 CSV with UTF-8 BOM", async () => {
    const leadsRes = await pool.query(`
      SELECT 
        l.id AS lead_id,
        c.name AS company_name,
        c.domain AS website,
        c.industry,
        c.size_range,
        hs.role_title,
        l.hiring_type,
        hs.source_url,
        co.full_name AS contact_name,
        co.title AS contact_title,
        co.email AS contact_email,
        co.verified AS contact_verified,
        l.fit_score,
        l.stage AS lead_stage,
        COALESCE(hs.raw_payload->>'location', 'Remote') AS location,
        hs.detected_at
      FROM leads l
      JOIN companies c ON l.company_id = c.id
      LEFT JOIN contacts co ON l.primary_contact_id = co.id
      LEFT JOIN hiring_signals hs ON l.hiring_signal_id = hs.id
      LIMIT 5;
    `);

    const csvOutput = serializeLeadsToCsv(leadsRes.rows);
    assert.ok(csvOutput.startsWith("\uFEFF"), "CSV must start with UTF-8 BOM for Excel compatibility");
    assert.ok(csvOutput.includes("Company Name,Website,Industry,Company Size"), "CSV must include correct headers");
    assert.ok(csvOutput.includes(leadsRes.rows[0].company_name), "CSV must include actual scraped data");
  });

  test("Step 4: Export Engine builds styled Excel (.xlsx) workbook", async () => {
    const leadsRes = await pool.query(`
      SELECT 
        l.id AS lead_id,
        c.name AS company_name,
        c.domain AS website,
        c.industry,
        c.size_range,
        hs.role_title,
        l.hiring_type,
        hs.source_url,
        co.full_name AS contact_name,
        co.title AS contact_title,
        co.email AS contact_email,
        co.verified AS contact_verified,
        l.fit_score,
        l.stage AS lead_stage,
        COALESCE(hs.raw_payload->>'location', 'Remote') AS location,
        hs.detected_at
      FROM leads l
      JOIN companies c ON l.company_id = c.id
      LEFT JOIN contacts co ON l.primary_contact_id = co.id
      LEFT JOIN hiring_signals hs ON l.hiring_signal_id = hs.id
      LIMIT 5;
    `);

    const workbook = await buildLeadsExcelWorkbook(leadsRes.rows);
    const buffer = await workbook.xlsx.writeBuffer();
    assert.ok(Buffer.isBuffer(buffer), "Workbook must produce a valid binary Buffer");
    assert.ok(buffer.length > 5000, "Excel file must contain zip/xml structures (>5KB)");

    const worksheet = workbook.getWorksheet("Verified Leads");
    assert.ok(worksheet, "Worksheet 'Verified Leads' must exist");
    assert.strictEqual(worksheet.views[0].ySplit, 1, "Header row must be frozen");
  });
});
