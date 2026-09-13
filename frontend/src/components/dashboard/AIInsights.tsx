import { useQuery } from "@tanstack/react-query";
import { Sparkles, TrendingUp, Target, Lightbulb } from "lucide-react";
import { api } from "@/services/api";

interface InsightItem {
  id: string;
  title: string;
  description: string;
  type: "trend" | "quality" | "action";
}

const getInsightIcon = (type: InsightItem["type"]) => {
  switch (type) {
    case "trend":
      return <TrendingUp className="h-4 w-4 text-violet-600 dark:text-violet-400" />;
    case "quality":
      return <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case "action":
      return <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
  }
};

const AIInsights = () => {
  const { data: insights, isLoading } = useQuery<InsightItem[]>({
    queryKey: ["ai-insights"],
    queryFn: async () => {
      const { data } = await api.get("/analytics/insights");
      return data.data ?? [];
    },
  });

  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#111827]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">AI Insights</h2>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
          <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      )}

      {!isLoading && (!insights || insights.length === 0) && (
        <div className="flex flex-1 flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
          <Sparkles className="mb-3 h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium">Gathering market signals...</p>
        </div>
      )}

      {!isLoading && insights && insights.length > 0 && (
        <div className="space-y-3 overflow-y-auto max-h-[320px] pr-1">
          {insights.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-violet-200 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-xs dark:bg-slate-800">
                  {getInsightIcon(item.type)}
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIInsights;