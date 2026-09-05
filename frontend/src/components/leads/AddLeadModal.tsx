import { useState } from "react";
import { X, UserPlus, Building2, Mail, Briefcase, Award } from "lucide-react";
import type { LeadStage, HiringType } from "@/types/lead";

interface AddLeadModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (leadData: NewLeadFormData) => Promise<void>;
}

export interface NewLeadFormData {
  companyName: string;
  companyDomain?: string;
  contactName?: string;
  contactEmail?: string;
  contactTitle?: string;
  roleTitle?: string;
  hiringType: HiringType;
  stage: LeadStage;
  fitScore: number;
}

const HIRING_TYPES: { value: HiringType; label: string }[] = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERN", label: "Internship" },
  { value: "BULK_HIRING", label: "Bulk Hiring" },
  { value: "CAMPUS_DRIVE", label: "Campus Drive" },
];

const STAGES: { value: LeadStage; label: string }[] = [
  { value: "NEW", label: "New Lead" },
  { value: "SENT", label: "Contacted" },
  { value: "REPLIED", label: "Replied" },
  { value: "MEETING_BOOKED", label: "Meeting Booked" },
  { value: "WON", label: "Client Won" },
];

export default function AddLeadModal({ open, onClose, onSubmit }: AddLeadModalProps) {
  const [formData, setFormData] = useState<NewLeadFormData>({
    companyName: "",
    companyDomain: "",
    contactName: "",
    contactEmail: "",
    contactTitle: "",
    roleTitle: "",
    hiringType: "FULL_TIME",
    stage: "NEW",
    fitScore: 85,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      setError("Company name is required.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        companyName: "",
        companyDomain: "",
        contactName: "",
        contactEmail: "",
        contactTitle: "",
        roleTitle: "",
        hiringType: "FULL_TIME",
        stage: "NEW",
        fitScore: 85,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm md:items-center">
      <div className="my-8 w-full max-w-2xl rounded-3xl bg-white shadow-2xl dark:bg-[#111827]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Lead</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Create a qualified recruitment lead and hiring signal.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Company Details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <Building2 size={14} /> Company Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Corp"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Company Website / Domain
              </label>
              <input
                type="text"
                placeholder="e.g. acme.com"
                value={formData.companyDomain}
                onChange={(e) => setFormData({ ...formData, companyDomain: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Contact Person
              </label>
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <Mail size={14} /> Contact Email
              </label>
              <input
                type="email"
                placeholder="sarah@acme.com"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Contact Designation
              </label>
              <input
                type="text"
                placeholder="e.g. Head of Talent"
                value={formData.contactTitle}
                onChange={(e) => setFormData({ ...formData, contactTitle: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
              />
            </div>
          </div>

          {/* Hiring Details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <Briefcase size={14} /> Open Role Title
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Architect"
                value={formData.roleTitle}
                onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Hiring Type
              </label>
              <select
                value={formData.hiringType}
                onChange={(e) => setFormData({ ...formData, hiringType: e.target.value as HiringType })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
              >
                {HIRING_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pipeline Stage & Score */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Initial Pipeline Stage
              </label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as LeadStage })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Award size={14} /> AI Fit Score
                </span>
                <span className="font-bold text-violet-600 dark:text-violet-400">{formData.fitScore}%</span>
              </label>
              <input
                type="range"
                min="50"
                max="100"
                step="1"
                value={formData.fitScore}
                onChange={(e) => setFormData({ ...formData, fitScore: Number(e.target.value) })}
                className="h-2 w-full cursor-pointer accent-violet-600"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-violet-700 disabled:opacity-50"
            >
              {isSubmitting ? "Creating Lead..." : "Add Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}