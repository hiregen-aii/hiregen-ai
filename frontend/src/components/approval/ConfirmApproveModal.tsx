import { CheckCircle2, X } from "lucide-react";
import type { ApprovalDraft } from "@/data/approval";

interface ConfirmApproveModalProps {
  open: boolean;
  draft: ApprovalDraft | null;
  onClose: () => void;
  onConfirm: (draft: ApprovalDraft) => void;
}

const ConfirmApproveModal = ({
  open,
  draft,
  onClose,
  onConfirm,
}: ConfirmApproveModalProps) => {
  if (!open || !draft) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl dark:bg-[#111827]">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>

            <div>

              <h2 className="text-xl font-bold dark:text-white">
                Approve Draft
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                This email will be marked as approved.
              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        {/* Body */}

        <div className="px-6 py-8">

          <p className="text-slate-600 dark:text-slate-300">
            Are you sure you want to approve the AI-generated draft for
          </p>

          <h3 className="mt-3 text-lg font-semibold text-green-600">
            {draft.company}
          </h3>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Once approved, the draft will be ready for sending or scheduling.
          </p>

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5 dark:border-slate-700">

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-2.5 font-medium transition hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={() => onConfirm(draft)}
            className="rounded-xl bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700"
          >
            Approve Draft
          </button>

        </div>

      </div>

    </div>
  );
};

export default ConfirmApproveModal;