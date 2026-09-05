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

      return {
        id: lead.id,
        companyId: lead.company_id,
        contactId: lead.primary_contact_id,
        ownerId: lead.owner_id,
        company: company?.name ?? "Unknown company",
        industry: company?.industry ?? "—",
        website: company?.domain ? `https://${company.domain}` : "—",
        contact: contact?.full_name ?? "No contact linked",
        designation: contact?.title ?? "—",
        email: contact?.email ?? "—",
        type: lead.hiring_type ? TYPE_LABELS[lead.hiring_type] : "—",
        score: lead.fit_score,
        status: STAGE_LABELS[lead.stage],
        stage: lead.stage,
      };
    });
  }, [leadsQuery.data, companiesQuery.data, contactsQuery.data]);

  return { enrichedLeads, isLoading, isError, error };
}