const { test, describe } = require("node:test");
const assert = require("node:assert");
const { verifyDomainEmailDeliverability, verifyDomainHostExists } = require("../../src/utils/dnsVerifier");

describe("Company Domain & MX Deliverability Verifier", () => {
  test("returns false for non-existent fake domain", async () => {
    const res = await verifyDomainEmailDeliverability("fake-non-existent-company-domain-99999.xyz");
    assert.strictEqual(res.isDeliverable, false);
  });

  test("verifies genuine company domain (vercel.com) has valid MX records", async () => {
    const res = await verifyDomainEmailDeliverability("vercel.com");
    assert.strictEqual(res.isDeliverable, true);
    assert.ok(res.mxRecords.length > 0);
  });

  test("verifies host exists for authentic tech company domain", async () => {
    const exists = await verifyDomainHostExists("github.com");
    assert.strictEqual(exists, true);
  });
});
