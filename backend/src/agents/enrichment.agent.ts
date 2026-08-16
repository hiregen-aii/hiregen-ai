// Team 2 (2.2/2.3 Company + Contact Intelligence) — Owner: Gauri
// Resolves company domain/size/industry + finds HR/TA contact.
// Input: company name/domain
// Output: contacts (name, title, email) + companies metadata

import { companiesRepo } from "../repositories/companies.repo.js";
import { contactsRepo } from "../repositories/contacts.repo.js";

interface CompanyInput {
  name: string;
  domain?: string;
  industry?: string;
  sizeRange?: string;
  linkedinUrl?: string;
}

export async function runEnrichmentAgent(
  companyInput: CompanyInput
) {
  // Create company metadata
  const company = await companiesRepo.createCompany(
    companyInput.name,
    companyInput.domain ?? "",
    companyInput.industry ?? "",
    companyInput.sizeRange ?? "",
    companyInput.linkedinUrl ?? ""
  );

  // Fetch available contacts for this company
  const contacts = await contactsRepo.getContactsByCompany(
    company.id
  );

  return {
    company,
    contacts,
    message: "Company and contact enrichment completed",
  };
}