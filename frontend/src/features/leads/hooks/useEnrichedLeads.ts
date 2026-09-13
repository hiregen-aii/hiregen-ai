import { useMemo } from "react";
import { useLeads } from "@/hooks/useLeads";
import { useCompanies } from "@/hooks/useCompanies";
import { useContacts } from "@/hooks/useContacts";
import type { LeadStage, HiringType } from "@/types/lead";

const STAGE_LABELS: Record<LeadStage, string> = {
  NEW: "New",
  RESEARCHED: "Researched",
  OUTREACH_DRAFTED: "Draft Ready",
  APPROVED: "Approved",
  SENT: "Contacted",
  REPLIED: "Replied",
  MEETING_BOOKED: "Meeting",
  WON: "Client Won",
  LOST: "Lost",
};

const TYPE_LABELS: Record<HiringType, string> = {
  FULL_TIME: "Full Time",
  CONTRACT: "Contract",
  INTERN: "Internship",
  BULK_HIRING: "Bulk Hiring",
  CAMPUS_DRIVE: "Campus Drive",
};

export interface EnrichedLead {
  id: string;
  companyId: string;
  contactId: string | null;
  ownerId: string | null;
  company: string;
  industry: string;
  website: string;
  contact: string;
  designation: string;
  email: string;
  type: string;
  score: number;
  status: string;
  stage: LeadStage;
  source: string;
  sourceUrl?: string;
}

export function useEnrichedLeads() {
  const leadsQuery = useLeads();
  const companiesQuery = useCompanies();
  const contactsQuery = useContacts();

  const isLoading = leadsQuery.isLoading || companiesQuery.isLoading || contactsQuery.isLoading;
  const isError = leadsQuery.isError || companiesQuery.isError || contactsQuery.isError;
  const error = leadsQuery.error ?? companiesQuery.error ?? contactsQuery.error;

  const enrichedLeads: EnrichedLead[] = useMemo(() => {
    const leads = leadsQuery.data ?? [];
    const companies = companiesQuery.data ?? [];
    const contacts = contactsQuery.data ?? [];

    const companyMap = new Map(companies.map((c) => [c.id, c]));
    const contactMap = new Map(contacts.map((c) => [c.id, c]));

    return leads.map((lead) => {
      const company = companyMap.get(lead.company_id);
      const contact = lead.primary_contact_id ? contactMap.get(lead.primary_contact_id) : undefined;

      const companyName = lead.company_name || company?.name || "Verified Company";
      const companyDomain = lead.company_domain || company?.domain;
      const companyIndustry = lead.company_industry || company?.industry || "Technology";

      const contactName =
        lead.contact_name ||
        contact?.full_name ||
        `${companyName} Talent Acquisition`;

      const contactTitle =
        lead.contact_title ||
        contact?.title ||
        "Engineering Hiring Manager";

      const contactEmail =
        lead.contact_email ||
        contact?.email ||
        (companyDomain ? `careers@${companyDomain}` : "—");

      return {
        id: lead.id,
        companyId: lead.company_id,
        contactId: lead.primary_contact_id,
        ownerId: lead.owner_id,
        company: companyName,
        industry: companyIndustry,
        website: companyDomain ? `https://${companyDomain}` : "—",
        contact: contactName,
        designation: contactTitle,
        email: contactEmail,
        type: lead.hiring_type ? TYPE_LABELS[lead.hiring_type] : "Full Time",
        score: Number(lead.fit_score) || 85,
        status: STAGE_LABELS[lead.stage],
        stage: lead.stage,
        source: lead.source || "LinkedIn",
        sourceUrl: lead.source_url ?? undefined,
      };
    });
  }, [leadsQuery.data, companiesQuery.data, contactsQuery.data]);

  return { enrichedLeads, isLoading, isError, error };
}