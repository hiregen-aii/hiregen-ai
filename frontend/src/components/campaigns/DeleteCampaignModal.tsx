import {
  AlertTriangle,
  Trash2,
  X,
} from "lucide-react";

import type { Campaign } from "@/types/campaign";

interface DeleteCampaignModalProps {
  open: boolean;
  campaign: Campaign | null;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteCampaignModal = ({
  open,
  campaign,
  onClose,
  onDelete,
}: DeleteCampaignModalProps) => {
  if (!open || !campaign) return null;

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">

      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-[#111827]">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">

              <AlertTriangle
                size={30}
                className="text-red-600"
              />

            </div>

            <div>

              <h2 className="text-2xl font-bold dark:text-white">
                Delete Campaign
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                This action cannot be undone.
              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={22} />
          </button>

        </div>

        {/* Body */}

        <div className="p-6">

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-900/20">

            <h3 className="text-lg font-bold text-red-700 dark:text-red-300">
              Are you sure?
            </h3>

            <p className="mt-3 text-slate-700 dark:text-slate-300">
              You are about to permanently delete the
              following campaign:
            </p>

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">

              <h4 className="font-bold dark:text-white">
                {campaign.name}
              </h4>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {campaign.hiringType}
              </p>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Template: {campaign.template}
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Status: {campaign.status}
              </p>

            </div>

            <p className="mt-5 text-sm text-red-600 dark:text-red-400">
              This operation cannot be reversed.
            </p>

          </div>

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5 dark:border-slate-700">

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-2.5 font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700"
          >
            <Trash2 size={18} />
            Delete Campaign
          </button>

        </div>

      </div>

    </div>
  );
};

export default DeleteCampaignModal;