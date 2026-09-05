// Minimal shapes for company/contact lookups used ONLY by the Leads
// feature (to resolve a lead's company_id/primary_contact_id into a
// display name). This is deliberately NOT the full Company type used
// by the Company Profile page (types/company.ts) — that one has extra
// fields (tagline, ceo, stats, etc.) that don't exist on the real
// `companies` table and would conflict with this minimal, real shape.

export interface CompanyRef {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
}

export interface ContactRef {
  id: string;
  company_id: string | null;
  full_name: string | null;
  title: string | null;
  email: string | null;
  // NOTE: contacts table has no `phone` column — don't add one here.
}