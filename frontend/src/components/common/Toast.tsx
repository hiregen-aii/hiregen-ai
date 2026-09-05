import {
  CheckCircle,
  Pencil,
  Trash2,
  CalendarCheck,
  X,
} from "lucide-react";

import { useEffect } from "react";

interface ToastProps {
  open: boolean;
  title: string;
  message: string;
  type: "success" | "edit" | "delete" | "meeting";
  onClose: () => void;
}

const iconMap = {
  success: (
    <CheckCircle className="h-7 w-7 text-green-500" />
  ),
  edit: (
    <Pencil className="h-7 w-7 text-blue-500" />
  ),
  delete: (
    <Trash2 className="h-7 w-7 text-red-500" />
  ),
  meeting: (
    <CalendarCheck className="h-7 w-7 text-violet-500" />
  ),
};

const borderMap = {
  success: "border-l-green-500",
  edit: "border-l-blue-500",
  delete: "border-l-red-500",
  meeting: "border-l-violet-500",
};

const Toast = ({
  open,
  title,
  message,
  type,
  onClose,
}: ToastProps) => {
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999]">

      <div
        className={`min-w-[360px] rounded-2xl border border-slate-200 border-l-4 ${borderMap[type]} bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-[#111827]`}
      >
        <div className="flex items-start justify-between">

          <div className="flex gap-4">

            {iconMap[type]}

            <div>

              <h3 className="font-semibold text-slate-900 dark:text-white">
                {title}
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {message}
              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>

        </div>

      </div>

    </div>
  );
};

export default Toast;