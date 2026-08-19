import { Trash2, X } from "lucide-react";
import type { Lead } from "@/data/leads";

interface DeleteLeadDialogProps {
  open: boolean;
  lead: Lead | null;
  onClose: () => void;
  onConfirm: (lead: Lead) => void;
}

const DeleteLeadDialog = ({
  open,
  lead,
  onClose,
  onConfirm,
}: DeleteLeadDialogProps) => {
  if (!open || !lead) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl dark:bg-[#111827]">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-red-100 p-3 dark:bg-red-900/30">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>

            <div>

              <h2 className="text-xl font-bold dark:text-white">
                Delete Lead
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                This action cannot be undone.
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
            Are you sure you want to delete
          </p>

          <h3 className="mt-2 text-lg font-semibold text-red-600">
            {lead.company}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {lead.contact}
          </p>

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5 dark:border-slate-700">

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-2 font-medium transition hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={() => onConfirm(lead)}
            className="rounded-xl bg-red-600 px-5 py-2 font-semibold text-white transition hover:bg-red-700"
          >
            Delete Lead
          </button>

        </div>

      </div>

    </div>
  );
};

export default DeleteLeadDialog;