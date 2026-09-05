import { Inbox } from "lucide-react";

// NOTE FOR BACKEND: no global activity-feed endpoint exists yet — only
// GET /leads/:id/timeline (per-lead). To power this widget for real we'd
// need either a new GET /api/v1/activity endpoint (recent events across
// all leads) or a client-side fan-out over every lead's timeline, which
// doesn't scale. Flagging as a backend gap rather than faking entries.
const RecentActivity = () => {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#111827]">
      <h2 className="mb-8 text-2xl font-semibold text-slate-900 dark:text-white">
        Recent Activity
      </h2>

      <div className="flex flex-1 flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
        <Inbox className="mb-3 h-8 w-8" />
        <p className="text-sm font-medium">Not available yet</p>
        <p className="mt-1 max-w-[220px] text-xs">
          Needs a global activity feed endpoint on the backend.
        </p>
      </div>
    </div>
  );
};

export default RecentActivity;