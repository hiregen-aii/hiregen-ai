// Team 2 (2.2 Company Intelligence / 2.3 Contact Intelligence) — Owner: Gauri
//
// Was a TODO-only .ts stub before. Fresh implementation reusing Team 1's
// existing companies/contacts repositories.

const { getHiringSignalById, updateHiringSignalStatus } = require("../repositories/hiringSignals.repository");
const { getCompanyById, updateCompany } = require("../repositories/companies.repository");
const { getContactsByCompany, createContact } = require("../repositories/contacts.repository");
const { createAgentRun, updateAgentRun } = require("../repositories/agentRuns.repository");

const AGENT_NAME = "enrichment_agent";

function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

async function enrichCompanyMetadata(company, companyUpdates) {
  if (!companyUpdates) return company;

  const merged = {
    name: company.name,
    domain: company.domain,
    industry: companyUpdates.industry ?? company.industry,
    sizeRange: companyUpdates.sizeRange ?? company.size_range,
    linkedinUrl: companyUpdates.linkedinUrl ?? company.linkedin_url,
  };

  const changed =
    merged.industry !== company.industry ||
    merged.sizeRange !== company.size_range ||
    merged.linkedinUrl !== company.linkedin_url;

  if (!changed) return company;

  return updateCompany(
    company.id,
    merged.name,
    merged.domain,
    merged.industry,
    merged.sizeRange,
    merged.linkedinUrl
  );
}

async function resolveContact(companyId, contactInput) {
  if (!contactInput || !contactInput.email) return null;

  const targetEmail = normalizeEmail(contactInput.email);
  const existing = await getContactsByCompany(companyId);
  const match = existing.find((c) => normalizeEmail(c.email) === targetEmail);
  if (match) return match;

  return createContact(
    companyId,
    contactInput.fullName || null,
    contactInput.title || null,
    contactInput.email,
    contactInput.linkedinUrl || null,
    Boolean(contactInput.verified)
  );
}

async function runEnrichmentPipeline(hiringSignalId, enrichmentData = {}) {
  const startedAt = Date.now();
  const agentRun = await createAgentRun(
    null,
    AGENT_NAME,
    { hiringSignalId },
    hiringSignalId,
    null,
    null,
    null,
    "RUNNING",
    null,
    null,
    null
  ).catch(() => null);

  try {
    const signal = await getHiringSignalById(hiringSignalId);
    if (!signal) {
      throw new Error("Hiring signal not found");
    }
    if (!signal.company_id) {
      throw new Error(
        "Hiring signal has no company_id — Discovery Agent should have resolved this at signal-creation time."
      );
    }

    const company = await getCompanyById(signal.company_id);
    if (!company) {
      throw new Error(`Company ${signal.company_id} not found`);
    }

    const enrichedCompany = await enrichCompanyMetadata(company, enrichmentData.company);
    const contact = await resolveContact(company.id, enrichmentData.contact);

    let updatedSignal = signal;
    if (signal.status === "ENRICHING") {
      updatedSignal = await updateHiringSignalStatus(hiringSignalId, "RESEARCHED");
    }

    if (agentRun) {
      await updateAgentRun(
        agentRun.id,
        { contactId: contact ? contact.id : null },
        "SUCCEEDED",
        Date.now() - startedAt,
        0,
        new Date().toISOString()
      ).catch(() => {});
    }

    return {
      hiringSignal: updatedSignal,
      company: enrichedCompany,
      contact,
    };
  } catch (err) {
    if (agentRun) {
      await updateAgentRun(
        agentRun.id,
        { error: err.message },
        "FAILED",
        Date.now() - startedAt,
        0,
        new Date().toISOString()
      ).catch(() => {});
    }
    throw err;
  }
}

module.exports = { runEnrichmentPipeline };