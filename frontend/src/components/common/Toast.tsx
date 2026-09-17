import {
  CheckCircle,
  Pencil,
  Trash2,
  CalendarCheck,
  AlertCircle,
  X,
} from "lucide-react";

import React, { useEffect, useState, useRef } from "react";

export type ToastType = "success" | "edit" | "delete" | "meeting" | "error";

interface ToastProps {
  open: boolean;
  title: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-6 w-6 text-emerald-500 shrink-0" />,
  edit: <Pencil className="h-6 w-6 text-blue-500 shrink-0" />,
  delete: <Trash2 className="h-6 w-6 text-red-500 shrink-0" />,
  meeting: <CalendarCheck className="h-6 w-6 text-violet-500 shrink-0" />,
  error: <AlertCircle className="h-6 w-6 text-rose-500 shrink-0" />,
};

const borderMap: Record<ToastType, string> = {
  success: "border-l-emerald-500",
  edit: "border-l-blue-500",
  delete: "border-l-red-500",
  meeting: "border-l-violet-500",
  error: "border-l-rose-500",
};

const progressColorMap: Record<ToastType, string> = {
  success: "bg-emerald-500",
  edit: "bg-blue-500",
  delete: "bg-red-500",
  meeting: "bg-violet-500",
  error: "bg-rose-500",
};

const Toast = ({
  open,
  title,
  message,
  type,
  duration = 6500,
  onClose,
}: ToastProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef<number>(Date.now());
  const remainingRef = useRef<number>(duration);

  useEffect(() => {
    if (!open) {
      setProgress(100);
      return;
    }

    remainingRef.current = duration;
    startTimeRef.current = Date.now();
    setProgress(100);

    const interval = setInterval(() => {
      if (isHovered) return;
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct <= 0) {
        clearInterval(interval);
        onClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [open, duration, onClose, isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed top-6 right-6 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`relative min-w-[360px] max-w-[480px] overflow-hidden rounded-2xl border border-slate-200 border-l-4 ${borderMap[type] || borderMap.success} bg-white p-5 shadow-2xl transition-all dark:border-slate-700 dark:bg-[#111827]`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {iconMap[type] || iconMap.success}
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white leading-tight">
                {title}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Dismiss notification"
            className="rounded-lg p-1 text-slate-400 hover:text-slate-700 transition hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar countdown (pauses on hover) */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full ${progressColorMap[type] || progressColorMap.success} transition-[width] duration-75 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Toast;