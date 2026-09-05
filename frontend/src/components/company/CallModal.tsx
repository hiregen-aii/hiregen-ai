import { Phone, PhoneCall, X } from "lucide-react";

import type { Company } from "@/types/company";

interface CallModalProps {
  open: boolean;
  company: Company | null;
  onClose: () => void;
  onCall: () => void;
}

const CallModal = ({
  open,
  company,
  onClose,
  onCall,
}: CallModalProps) => {
  if (!open || !company) return null;

  const handleCall = () => {
    onCall();

    window.open(`tel:${company.phone}`);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl dark:bg-[#111827]">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
              <PhoneCall
                size={24}
                className="text-green-600"
              />
            </div>

            <div>

              <h2 className="text-xl font-bold dark:text-white">
                Call Company
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Confirm before starting the call.
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

        <div className="px-6 py-8 text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">

            <Phone
              size={34}
              className="text-green-600"
            />

          </div>

          <h3 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
            {company.name}
          </h3>

          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            {company.phone}
          </p>

          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            This will open your device's default calling application.
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
            onClick={handleCall}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700"
          >
            <PhoneCall size={18} />
            Call Now
          </button>

        </div>

      </div>
    </div>
  );
};

export default CallModal;