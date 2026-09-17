export type CandidateStatus =
  | "AVAILABLE"
  | "SCREENING"
  | "SHORTLISTED"
  | "INTERVIEWING"
  | "OFFERED"
  | "HIRED"
  | "ARCHIVED";

export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  headline: string;
  current_company?: string | null;
  location: string;
  skills: string[];
  experience_years: number;
  preferred_role?: string | null;
  expected_salary?: string | null;
  notice_period?: string | null;
  hiring_type?: string | null;
  status: CandidateStatus;
  source: string;
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
  fit_score: number;
  verified: boolean;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateStats {
  totalCandidates: number;
  availableCandidates: number;
  immediateJoiners: number;
  topTierMatches: number;
  avgFitScore: number;
  topHubs: Array<{ location: string; count: string | number }>;
}

export interface CandidateFilters {
  search?: string;
  location?: string;
  skill?: string;
  status?: string;
  availability?: string;
  experience?: string;
  minScore?: string;
}
