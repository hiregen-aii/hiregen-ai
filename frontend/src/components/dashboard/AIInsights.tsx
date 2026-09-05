import { Sparkles } from "lucide-react";

// NOTE: AI-generated insights are a Team 3 (AI Platform) capability —
// Personalization/Analytics modules, bridged over HTTP on port 3100.
// Team 2's /leads data alone can't produce these. Wire this up once
// there's a Team 3 endpoint exposed for dashboard-level insights.
const AIInsights = () => {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#111827]">
      <h2 className="mb-8 text-2xl font-semibold text-slate-900 dark:text-white">AI Insights</h2>

      <div className="flex flex-1 flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
        <Sparkles className="mb-3 h-8 w-8" />
        <p className="text-sm font-medium">Not available yet</p>
        <p className="mt-1 max-w-[220px] text-xs">
          Depends on a Team 3 (AI Platform) insights endpoint, not yet exposed to the frontend.
        </p>
      </div>
    </div>
  );
};

export default AIInsights;