import type {
  Company,
  CompanyDocument,
} from "@/types/company";

export const companyData: Company = {
  id: 1,

  name: "HireGen AI Private Limited",

  tagline:
    "AI Recruitment Platform helping companies hire skilled candidates faster and smarter.",

  description:
    "HireGen AI is an AI-powered recruitment platform that simplifies talent acquisition by automating outreach, lead management, candidate engagement, and hiring workflows.",

  status: "Active",

  industry: "Artificial Intelligence",

  location: "Bangalore, Karnataka",

  website: "https://www.hiregen.ai",

  email: "contact@hiregen.ai",

  phone: "+91 98765 43210",

  ceo: "John Smith",

  employees: 245,

  established: 2023,

  hiringProgress: 85,

  linkedin: "https://www.linkedin.com/company/hiregen-ai",

  stats: {
    employees: 245,
    companies: 152,
    documents: 3,
    hiringProgress: 85,
  },
};

export const companyDocuments: CompanyDocument[] = [
  {
    id: 1,
    name: "Proposal.pdf",
    type: "pdf",
    uploadedAt: "15 Jul 2026",
  },
  {
    id: 2,
    name: "Meeting Notes.docx",
    type: "docx",
    uploadedAt: "18 Jul 2026",
  },
  {
    id: 3,
    name: "Quotation.pdf",
    type: "pdf",
    uploadedAt: "20 Jul 2026",
  },
];

export const quickActions = [
  {
    id: 1,
    title: "Send Email",
    description: "Contact company",
    icon: "mail",
  },
  {
    id: 2,
    title: "Call",
    description: "Start a phone call",
    icon: "phone",
  },
  {
    id: 3,
    title: "LinkedIn",
    description: "Open LinkedIn",
    icon: "linkedin",
  },
  {
    id: 4,
    title: "Meeting",
    description: "Schedule meeting",
    icon: "calendar",
  },
];