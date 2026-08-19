import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Video,
  X,
} from "lucide-react";

import type {
  Company,
  MeetingData,
} from "@/types/company";

interface ScheduleMeetingModalProps {
  open: boolean;
  company: Company | null;
  onClose: () => void;
  onSchedule: (meeting: MeetingData) => void;
}

const ScheduleMeetingModal = ({
  open,
  company,
  onClose,
  onSchedule,
}: ScheduleMeetingModalProps) => {
  const [meeting, setMeeting] = useState<
    MeetingData & {
      type: "Online" | "Offline";
      location: string;
    }
  >({
    date: "",
    time: "",
    notes: "",
    type: "Online",
    location: "",
  });

  useEffect(() => {
    if (!open) {
      setMeeting({
        date: "",
        time: "",
        notes: "",
        type: "Online",
        location: "",
      });
    }
  }, [open]);

  if (!open || !company) return null;

  const handleChange = (
    key: keyof typeof meeting,
    value: string
  ) => {
    setMeeting((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSchedule = () => {
    if (!meeting.date || !meeting.time) {
      alert("Please select meeting date and time.");
      return;
    }

    onSchedule({
      date: meeting.date,
      time: meeting.time,
      notes: meeting.notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/60 p-4 md:items-center">

      <div className="my-8 w-full max-w-3xl rounded-3xl bg-white shadow-2xl dark:bg-[#111827]">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/30">

              <CalendarDays
                size={24}
                className="text-orange-600"
              />

            </div>

            <div>

              <h2 className="text-xl font-bold dark:text-white">
                Schedule Meeting
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Schedule a meeting with{" "}
                <span className="font-semibold">
                  {company.name}
                </span>
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

        <div className="grid max-h-[60vh] grid-cols-1 gap-6 overflow-y-auto p-6 md:grid-cols-2">

          {/* Date */}

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Meeting Date
            </label>

            <div className="relative">

              <CalendarDays
                size={18}
                className="absolute left-4 top-4 text-slate-400"
              />

              <input
                type="date"
                value={meeting.date}
                onChange={(e) =>
                  handleChange("date", e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 py-3 pl-12 pr-4 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />

            </div>

          </div>

          {/* Time */}

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Meeting Time
            </label>

            <div className="relative">

              <Clock
                size={18}
                className="absolute left-4 top-4 text-slate-400"
              />

              <input
                type="time"
                value={meeting.time}
                onChange={(e) =>
                  handleChange("time", e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 py-3 pl-12 pr-4 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />

            </div>

          </div>

          {/* Meeting Type */}

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Meeting Type
            </label>

            <select
              value={meeting.type}
              onChange={(e) =>
                handleChange(
                  "type",
                  e.target.value as "Online" | "Offline"
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option>Online</option>
              <option>Offline</option>
            </select>

          </div>

          {/* Location */}

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Meeting Location
            </label>

            <div className="relative">

              {meeting.type === "Online" ? (
                <Video
                  size={18}
                  className="absolute left-4 top-4 text-slate-400"
                />
              ) : (
                <MapPin
                  size={18}
                  className="absolute left-4 top-4 text-slate-400"
                />
              )}

              <input
                type="text"
                placeholder={
                  meeting.type === "Online"
                    ? "Google Meet / Zoom"
                    : "Office Address"
                }
                value={meeting.location}
                onChange={(e) =>
                  handleChange("location", e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 py-3 pl-12 pr-4 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />

            </div>

          </div>

                    {/* Notes */}

          <div className="md:col-span-2">

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Meeting Agenda / Notes
            </label>

            <textarea
              rows={5}
              value={meeting.notes}
              onChange={(e) =>
                handleChange("notes", e.target.value)
              }
              placeholder="Discuss recruitment requirements, hiring strategy, product demo, pricing..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

        </div>

        {/* Summary */}

        <div className="mx-6 mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-800 dark:bg-orange-900/20">

          <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300">
            Meeting Summary
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">

            <div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Company
              </p>

              <p className="font-semibold dark:text-white">
                {company.name}
              </p>

            </div>

            <div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Contact Person
              </p>

              <p className="font-semibold dark:text-white">
                {company.ceo}
              </p>

            </div>

            <div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Meeting Type
              </p>

              <p className="font-semibold dark:text-white">
                {meeting.type}
              </p>

            </div>

            <div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Location
              </p>

              <p className="font-semibold dark:text-white">
                {meeting.location || "-"}
              </p>

            </div>

            <div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Date
              </p>

              <p className="font-semibold dark:text-white">
                {meeting.date || "-"}
              </p>

            </div>

            <div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Time
              </p>

              <p className="font-semibold dark:text-white">
                {meeting.time || "-"}
              </p>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-5 dark:border-slate-700 dark:bg-[#111827]">

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-2.5 font-medium transition hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={handleSchedule}
            className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-700"
          >
            <CalendarDays size={18} />
            Schedule Meeting
          </button>

        </div>

      </div>

    </div>
  );
};

export default ScheduleMeetingModal;