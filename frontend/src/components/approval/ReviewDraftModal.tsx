import { useEffect, useState } from "react";
import {
  X,
  Building2,
  User,
  Mail,
  Briefcase,
  Pencil,
  Save,
} from "lucide-react";

import type { ApprovalDraft } from "@/data/approval";

interface ReviewDraftModalProps {
  open: boolean;

  draft: ApprovalDraft | null;

  onClose: () => void;

  onSave: (draft: ApprovalDraft) => void;

  onApprove: () => void;

  onReject: () => void;

  onSchedule: () => void;
}

const ReviewDraftModal = ({
  open,
  draft,
  onClose,
  onSave,
  onApprove,
  onReject,
  onSchedule,
}: ReviewDraftModalProps) => {
  const [editing, setEditing] =
    useState(false);

  const [subject, setSubject] =
    useState("");

  const [body, setBody] =
    useState("");

  useEffect(() => {
    if (draft) {
      setSubject(draft.subject);
      setBody(draft.body);
      setEditing(false);
    }
  }, [draft]);

  if (!open || !draft) return null;

  const handleSave = () => {
    onSave({
      ...draft,
      subject,
      body,
    });

    setEditing(false);
  };

    return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6">

      <div className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#111827]">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6 dark:border-slate-700">

          <div>

            <h2 className="text-2xl font-bold dark:text-white">
              Review AI Draft
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review and approve the AI-generated outreach email.
            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-6 w-6" />
          </button>

        </div>

        {/* Content */}

        <div className="flex-1 overflow-y-auto p-8">

          {/* Company Information */}

          <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700">

            <h3 className="mb-6 text-lg font-semibold dark:text-white">
              Company Information
            </h3>

            <div className="grid grid-cols-2 gap-6">

              <InfoItem
                icon={<Building2 className="h-5 w-5" />}
                label="Company"
                value={draft.company}
              />

              <InfoItem
                icon={<Briefcase className="h-5 w-5" />}
                label="Industry"
                value={draft.industry}
              />

              <InfoItem
                icon={<User className="h-5 w-5" />}
                label="Contact"
                value={draft.contact}
              />

              <InfoItem
                icon={<Mail className="h-5 w-5" />}
                label="Email"
                value={draft.email}
              />

            </div>

          </div>

          {/* Subject */}

          <div className="mt-8">

            <div className="mb-3 flex items-center justify-between">

              <h3 className="text-lg font-semibold dark:text-white">
                Email Subject
              </h3>

              {!editing ? (

                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>

              ) : (

                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>

              )}

            </div>

            <input
              value={subject}
              disabled={!editing}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

          {/* Email */}

          <div className="mt-8">

            <h3 className="mb-3 text-lg font-semibold dark:text-white">
              Generated Email
            </h3>

            <textarea
              rows={16}
              value={body}
              disabled={!editing}
              onChange={(e) => setBody(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-5 py-4 outline-none transition focus:border-violet-500 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

                      </div>

        </div>

        {/* Footer */}

        <div className="flex items-center justify-between border-t border-slate-200 px-8 py-6 dark:border-slate-700">

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-6 py-2.5 font-medium transition hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Close
          </button>

          <div className="flex items-center gap-3">

            <button
              onClick={onReject}
              className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white transition hover:bg-red-700"
            >
              Reject
            </button>

            <button
              onClick={onSchedule}
              className="rounded-xl bg-blue-600 px-6 py-2.5 font-semibold text-white transition hover:bg-blue-700"
            >
              Schedule
            </button>

            <button
              onClick={onApprove}
              className="rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white transition hover:bg-green-700"
            >
              Approve
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoItem = ({
  icon,
  label,
  value,
}: InfoItemProps) => (
  <div className="flex items-start gap-3">

    <div className="mt-1 text-violet-600">
      {icon}
    </div>

    <div>

      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-medium text-slate-900 dark:text-white">
        {value}
      </p>

    </div>

  </div>
);

export default ReviewDraftModal;