import { Trophy } from "lucide-react";

// NOTE FOR BACKEND: leads.owner_id references users(id) but there's no
// GET /api/v1/users (or similar) endpoint to resolve names, and no
// per-recruiter aggregation endpoint. Needs both before this can show
// real recruiter names/scores instead of a placeholder.
const TeamPerformance = () => {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#111827]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Team Performance
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Recruiter productivity</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30">
          <Trophy className="h-6 w-6 text-violet-600 dark:text-violet-300" />
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
        <p className="text-sm font-medium">Not available yet</p>
        <p className="mt-1 max-w-[220px] text-xs">
          Needs a users list + per-recruiter aggregation endpoint on the backend.
        </p>
      </div>
    </div>
  );
};

export default TeamPerformance;