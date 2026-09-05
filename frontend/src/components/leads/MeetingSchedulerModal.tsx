import { useState, useEffect } from "react";
import { CalendarPlus, X } from "lucide-react";
import type { Lead } from "@/data/leads";

interface MeetingSchedulerModalProps {
  open: boolean;
  lead: Lead | null;
  onClose: () => void;
  onSchedule: (
    date: string,
    time: string,
    link: string,
    notes: string
  ) => void;
}

const MeetingSchedulerModal = ({
  open,
  lead,
  onClose,
  onSchedule,
}: MeetingSchedulerModalProps) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setDate("");
      setTime("");
      setLink("");
      setNotes("");
    }
  }, [open]);

  if (!open || !lead) return null;

  const handleSubmit = () => {
    if (!date || !time) {
      alert("Please select meeting date and time.");
      return;
    }

    onSchedule(date, time, link, notes);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl dark:bg-[#111827]">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6 dark:border-slate-700">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-violet-100 p-3 dark:bg-violet-900/30">
              <CalendarPlus className="h-6 w-6 text-violet-600" />
            </div>

            <div>

              <h2 className="text-2xl font-bold dark:text-white">
                Schedule Meeting
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                {lead.company}
              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        {/* Body */}

        <div className="space-y-5 p-8">

          <div>
            <label className="mb-2 block text-sm font-medium dark:text-white">
              Company
            </label>

            <input
              value={lead.company}
              disabled
              className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">

            <div>

              <label className="mb-2 block text-sm font-medium dark:text-white">
                Meeting Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium dark:text-white">
                Meeting Time
              </label>

              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Meeting Link
            </label>

            <input
              placeholder="https://meet.google.com/..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Notes
            </label>

            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Meeting agenda..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t border-slate-200 px-8 py-6 dark:border-slate-700">

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-6 py-2.5 font-medium transition hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 font-semibold text-white transition hover:opacity-90"
          >
            Schedule Meeting
          </button>

        </div>

      </div>

    </div>
  );
};

export default MeetingSchedulerModal;