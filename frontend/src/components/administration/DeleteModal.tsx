import {
  AlertTriangle,
  Trash2,
  X,
} from "lucide-react";

interface DeleteModalProps {
  open: boolean;

  type:
    | "user"
    | "role"
    | "company";

  name: string;

  onClose: () => void;

  onDelete: () => void;
}

const DeleteModal = ({
  open,
  type,
  name,
  onClose,
  onDelete,
}: DeleteModalProps) => {

  if (!open) return null;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-[#111827]">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">

          <div className="flex items-center gap-3">

            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">

              <AlertTriangle
                size={22}
                className="text-red-600"
              />

            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Delete Confirmation
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

            <X size={20} />

          </button>

        </div>

        {/* Content */}

        <div className="space-y-5 p-6">

                      <div className="flex justify-center">

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">

              <Trash2
                size={38}
                className="text-red-600"
              />

            </div>

          </div>

          <div className="text-center">

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">

              Delete{" "}

              {type === "user"
                ? "User"
                : type === "role"
                ? "Role"
                : "Company"}

              ?

            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">

              You are about to permanently delete

              <span className="mx-1 font-semibold text-slate-900 dark:text-white">
                "{name}"
              </span>

              from the system.

            </p>

            <p className="mt-2 text-sm text-red-600 dark:text-red-400">

              This action cannot be undone.

            </p>

          </div>

                  </div>

        {/* Footer */}

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-6 dark:border-slate-700">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition-all duration-300 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:bg-red-700 hover:shadow-lg"
          >

            <Trash2 size={18} />

            Delete

          </button>

        </div>

      </div>

    </div>

  );
};

export default DeleteModal;