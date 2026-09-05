import { useState, useEffect } from "react";
import { X, Edit3, Award, Building2 } from "lucide-react";
import type { LeadStage } from "@/types/lead";
import type { EnrichedLead } from "@/features/leads/hooks/useEnrichedLeads";

interface EditLeadModalProps {
  lead: EnrichedLead | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (leadId: string, data: { stage: LeadStage; fitScore: number }) => Promise<void>;
}

const STAGES: { value: LeadStage; label: string }[] = [
  { value: "NEW", label: "New Lead" },
  { value: "SENT", label: "Contacted" },
  { value: "REPLIED", label: "Replied" },
  { value: "MEETING_BOOKED", label: "Meeting Booked" },
  { value: "WON", label: "Client Won" },
];

export default function EditLeadModal({ lead, open, onClose, onSubmit }: EditLeadModalProps) {
  const [stage, setStage] = useState<LeadStage>("NEW");
  const [fitScore, setFitScore] = useState(85);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lead) {
      setStage(lead.stage);
      setFitScore(Math.round(lead.score) || 85);
    }
  }, [lead]);

  if (!open || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(lead.id, { stage, fitScore });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-[#111827]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300">
              <Edit3 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Lead</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Update pipeline stage and AI fit score.
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

          {/* Company Info */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300">
                <Building2 size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">{lead.company}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lead.contact} • {lead.designation}
                </p>
              </div>
            </div>
          </div>

          {/* Stage */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Pipeline Stage
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as LeadStage)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
            >
              {STAGES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Fit Score */}
          <div>
            <label className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Award size={14} /> AI Fit Score
              </span>
              <span className="font-bold text-violet-600 dark:text-violet-400">{fitScore}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={fitScore}
              onChange={(e) => setFitScore(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-violet-600"
            />
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
