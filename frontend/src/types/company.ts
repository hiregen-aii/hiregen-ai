export interface Company {
  id: number;
  name: string;
  tagline: string;
  description: string;
  status: "Active" | "Inactive";

  industry: string;
  location: string;
  website: string;

  email: string;
  phone: string;

  ceo: string;
  employees: number;
  established: number;

  hiringProgress: number;
  linkedin: string;

  stats: {
    employees: number;
    companies: number;
    documents: number;
    hiringProgress: number;
  };
}

export interface CompanyDocument {
  id: number;
  name: string;
  type: "pdf" | "doc" | "docx";
  uploadedAt: string;
}

export interface EmailData {
  to: string;
  subject: string;
  message: string;
}

export interface MeetingData {
  date: string;
  time: string;
  notes: string;
}