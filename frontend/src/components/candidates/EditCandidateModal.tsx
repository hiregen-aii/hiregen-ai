import { useState, useEffect } from "react";
import { X, Edit3 } from "lucide-react";
import type { Candidate, CandidateStatus } from "@/types/candidate";
import type { UpdateCandidatePayload } from "@/services/candidates.service";

interface EditCandidateModalProps {
  candidate: Candidate | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (id: string, updateData: UpdateCandidatePayload) => Promise<void>;
}

export default function EditCandidateModal({
  candidate,
  open,
  onClose,
  onSubmit,
}: EditCandidateModalProps) {
  const [formData, setFormData] = useState<UpdateCandidatePayload>({});
  const [skillsInput, setSkillsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (candidate) {
      setFormData({
        fullName: candidate.full_name,
        phone: candidate.phone || "",
        headline: candidate.headline,
        currentCompany: candidate.current_company || "",
        location: candidate.location,
        experienceYears: candidate.experience_years,
        expectedSalary: candidate.expected_salary || "",
        noticePeriod: candidate.notice_period || "",
        status: candidate.status,
        linkedinUrl: candidate.linkedin_url || "",
        githubUrl: candidate.github_url || "",
        bio: candidate.bio || "",
      });
      setSkillsInput(Array.isArray(candidate.skills) ? candidate.skills.join(", ") : "");
    }
  }, [candidate]);

  if (!open || !candidate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const skillsArray = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await onSubmit(candidate.id, {
        ...formData,
        skills: skillsArray,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update candidate profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-[#111827]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-950/40">
              <Edit3 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Edit Candidate Profile
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update status, skills, or contact info for {candidate.full_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName || ""}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Pipeline Status
              </label>
              <select
                value={formData.status || candidate.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CandidateStatus })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="SCREENING">SCREENING</option>
                <option value="SHORTLISTED">SHORTLISTED</option>
                <option value="INTERVIEWING">INTERVIEWING</option>
                <option value="OFFERED">OFFERED</option>
                <option value="HIRED">HIRED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Headline / Role
            </label>
            <input
              type="text"
              value={formData.headline || ""}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Location (India)
              </label>
              <input
                type="text"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                max="25"
                value={formData.experienceYears ?? candidate.experience_years}
                onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value, 10) || 0 })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Technical Skills (Comma separated)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
