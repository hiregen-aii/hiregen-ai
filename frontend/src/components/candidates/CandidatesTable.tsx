import { useState, useRef, useEffect } from "react";
import {
  User,
  CheckCircle2,
  MapPin,
  Briefcase,
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  ExternalLink,
  Edit2,
  Trash2,
} from "lucide-react";
import type { Candidate } from "@/types/candidate";

interface CandidatesTableProps {
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  setSelectedCandidate: (candidate: Candidate) => void;
  onEditCandidate: (candidate: Candidate) => void;
  onDeleteCandidate: (candidate: Candidate) => void;
  onExport?: (format: "csv" | "xlsx") => void;
}

const statusBadgeColor = (status: string) => {
  switch (status) {
    case "AVAILABLE":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    case "SCREENING":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    case "SHORTLISTED":
      return "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border-violet-200 dark:border-violet-800";
    case "INTERVIEWING":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    case "OFFERED":
    case "HIRED":
      return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300 border-green-200 dark:border-green-800";
    case "ARCHIVED":
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  }
};

const CandidatesTable = ({
  candidates,
  selectedCandidate,
  setSelectedCandidate,
  onEditCandidate,
  onDeleteCandidate,
  onExport,
}: CandidatesTableProps) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#111827]">
      {/* Table Header Controls */}
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Active Candidates</h2>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            {candidates.length} Profiles
          </span>
        </div>

        {onExport && (
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setShowExportMenu((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Download size={13} className="text-emerald-600" />
              <span>Export Talent</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${showExportMenu ? "rotate-180" : ""}`} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 z-30 mt-1.5 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-[#111827]">
                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    onExport("csv");
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-1.5 text-xs text-slate-700 hover:bg-violet-50 hover:text-violet-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <FileText size={13} className="text-violet-600" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    onExport("xlsx");
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <FileSpreadsheet size={13} className="text-emerald-600" />
                  <span>Export Excel (.xlsx)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-6 py-3.5">Candidate</th>
              <th className="px-5 py-3.5">Headline & Role</th>
              <th className="px-5 py-3.5">Location</th>
              <th className="px-5 py-3.5">Core Skills</th>
              <th className="px-5 py-3.5">Exp / Notice</th>
              <th className="px-5 py-3.5 text-center">Fit Score</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {candidates.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-500 dark:text-slate-400">
                  <User size={36} className="mx-auto mb-2 opacity-30 text-slate-400" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">No candidates match current filters</p>
                  <p className="text-xs text-slate-400 mt-1">Try broadening your search or click "Sync Live Candidates" to ingest talent.</p>
                </td>
              </tr>
            ) : (
              candidates.map((c) => {
                const isSelected = selectedCandidate?.id === c.id;

                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCandidate(c)}
                    className={`cursor-pointer transition-colors duration-150 hover:bg-violet-50/60 dark:hover:bg-violet-950/20 ${
                      isSelected ? "bg-violet-50 dark:bg-violet-950/30" : ""
                    }`}
                  >
                    {/* Candidate Identity */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 font-bold text-white shadow-sm">
                          {getInitials(c.full_name)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {c.full_name}
                            </span>
                            {c.verified && (
                              <CheckCircle2 size={13} className="text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                            )}
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {c.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Headline */}
                    <td className="px-5 py-4 max-w-xs">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {c.headline}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Briefcase size={12} className="opacity-70" />
                        <span>{c.current_company || "Available Talent"}</span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300">
                        <MapPin size={12} className="text-emerald-600 flex-shrink-0" />
                        <span>{c.location}</span>
                      </div>
                    </td>

                    {/* Skills pills */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(c.skills || []).slice(0, 3).map((sk) => (
                          <span
                            key={sk}
                            className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {sk}
                          </span>
                        ))}
                        {(c.skills || []).length > 3 && (
                          <span className="rounded-lg bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500 dark:bg-slate-800">
                            +{c.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Exp / Notice */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {c.hiring_type === "INTERN" || c.experience_years === 0
                          ? "Intern / Trainee"
                          : c.experience_years === 1
                          ? "1 Year (Fresher)"
                          : `${c.experience_years} Years`}
                      </div>
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                        {c.notice_period || "Immediate"}
                      </div>
                    </td>

                    {/* Fit Score */}
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
                        <span>{Number(c.fit_score || 88).toFixed(0)}%</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeColor(c.status)}`}>
                        {c.status.replace("_", " ")}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {c.github_url && (
                          <a
                            href={c.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            title="GitHub Profile"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button
                          onClick={() => onEditCandidate(c)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-violet-600 dark:hover:bg-slate-800"
                          title="Edit Candidate"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteCandidate(c)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                          title="Delete Candidate"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CandidatesTable;
