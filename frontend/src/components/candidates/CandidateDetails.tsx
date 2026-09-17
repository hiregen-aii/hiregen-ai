import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Code2,
  Clock,
  Banknote,
} from "lucide-react";
import type { Candidate, CandidateStatus } from "@/types/candidate";

interface CandidateDetailsProps {
  selectedCandidate: Candidate | null;
  onStatusChange?: (id: string, status: CandidateStatus) => void;
  onScheduleInterview?: (candidate: Candidate) => void;
}

const CandidateDetails = ({
  selectedCandidate,
  onStatusChange,
  onScheduleInterview,
}: CandidateDetailsProps) => {
  const [selectedStatus, setSelectedStatus] = useState<CandidateStatus | "">("");

  if (!selectedCandidate) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-[#111827]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
          <Briefcase size={24} />
        </div>
        <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-white">
          Candidate Dossier
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Select any candidate from the table to inspect their skills, contact info, notice period, and portfolio.
        </p>
      </div>
    );
  }

  const c = selectedCandidate;

  const handleStatusSelect = (newStatus: CandidateStatus) => {
    setSelectedStatus(newStatus);
    onStatusChange?.(c.id, newStatus);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#111827] space-y-6">
      {/* Header Profile Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-xl font-bold text-white shadow-md shadow-emerald-500/20">
          {getInitials(c.full_name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {c.full_name}
            </h3>
            {c.verified && (
              <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-100 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
            {c.headline}
          </p>
          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            <MapPin size={12} />
            <span>{c.location}</span>
          </div>
        </div>
      </div>

      {/* Match Fit Score Bar */}
      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/40">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>Role Fit Match</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
            {Number(c.fit_score || 88).toFixed(0)}%
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, c.fit_score))}%` }}
          />
        </div>
      </div>

      {/* Status Pipeline Selector */}
      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
          Pipeline Status
        </label>
        <select
          value={selectedStatus || c.status}
          onChange={(e) => handleStatusSelect(e.target.value as CandidateStatus)}
          className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value="AVAILABLE">AVAILABLE (Active)</option>
          <option value="SCREENING">SCREENING (In Review)</option>
          <option value="SHORTLISTED">SHORTLISTED (Hiring Manager Review)</option>
          <option value="INTERVIEWING">INTERVIEWING (Scheduled)</option>
          <option value="OFFERED">OFFERED (Offer Extended)</option>
          <option value="HIRED">HIRED (Joined)</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
      </div>

      {/* Quick Contact & Compensation Grid */}
      <div className="space-y-2.5 text-xs">
        <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
          <Mail size={14} className="text-slate-400 flex-shrink-0" />
          <a href={`mailto:${c.email}`} className="text-violet-600 hover:underline truncate">
            {c.email}
          </a>
        </div>

        {c.phone && (
          <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
            <Phone size={14} className="text-slate-400 flex-shrink-0" />
            <a href={`tel:${c.phone}`} className="hover:underline">
              {c.phone}
            </a>
          </div>
        )}

        <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
          <Clock size={14} className="text-slate-400 flex-shrink-0" />
          <span>Notice Period: <strong className="text-amber-600 dark:text-amber-400">{c.notice_period || "Immediate"}</strong></span>
        </div>

        <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
          <Banknote size={14} className="text-slate-400 flex-shrink-0" />
          <span>Expected CTC: <strong>{c.expected_salary || "₹20 - 35 LPA"}</strong></span>
        </div>

        <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
          <Briefcase size={14} className="text-slate-400 flex-shrink-0" />
          <span>
            Experience:{" "}
            <strong>
              {c.hiring_type === "INTERN" || c.experience_years === 0
                ? "Intern / Student"
                : c.experience_years === 1
                ? "1 Year (Fresher)"
                : `${c.experience_years} Years`}
            </strong>
          </span>
        </div>
      </div>

      {/* Social & Portfolio Links */}
      <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
        {c.github_url && (
          <a
            href={c.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Code2 size={13} className="text-slate-600 dark:text-slate-400" />
            <span>GitHub</span>
            <ExternalLink size={11} className="opacity-60" />
          </a>
        )}

        {c.linkedin_url && (
          <a
            href={c.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
          >
            <span>LinkedIn</span>
            <ExternalLink size={11} className="opacity-60" />
          </a>
        )}

        {c.portfolio_url && (
          <a
            href={c.portfolio_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300"
          >
            <span>Portfolio</span>
            <ExternalLink size={11} className="opacity-60" />
          </a>
        )}
      </div>

      {/* Skills Cloud */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
          Verified Technical Skills
        </label>
        <div className="flex flex-wrap gap-1.5">
          {(c.skills || []).map((skill) => (
            <span
              key={skill}
              className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Bio / Background */}
      {c.bio && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
            Professional Overview
          </label>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
            {c.bio}
          </p>
        </div>
      )}

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          onClick={() => onScheduleInterview?.(c)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-700 hover:to-teal-700"
        >
          <Calendar size={14} />
          <span>Schedule Screening / Interview</span>
        </button>
      </div>
    </div>
  );
};

export default CandidateDetails;
