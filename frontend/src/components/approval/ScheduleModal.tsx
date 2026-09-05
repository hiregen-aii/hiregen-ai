import { useEffect, useState } from "react";
import { CalendarClock, X } from "lucide-react";

interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onSchedule: (
    date: string,
    time: string,
    notes: string
  ) => void;
}

const ScheduleModal = ({
  open,
  onClose,
  onSchedule,
}: ScheduleModalProps) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setDate("");
      setTime("");
      setNotes("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!date || !time) {
      alert("Please select date and time.");
      return;
    }

    onSchedule(date, time, notes);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-[#111827]">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
              <CalendarClock className="h-6 w-6 text-blue-600" />
            </div>

            <div>

              <h2 className="text-xl font-bold dark:text-white">
                Schedule Email
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Select when this draft should be sent.
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

        <div className="space-y-5 p-6">

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Schedule Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Schedule Time
            </label>

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Notes
            </label>

            <textarea
              rows={4}
              placeholder="Optional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

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
            onClick={handleSubmit}
            className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
          >
            Schedule
          </button>

        </div>

      </div>

    </div>
  );
};

export default ScheduleModal;