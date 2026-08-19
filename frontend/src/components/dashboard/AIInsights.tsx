import {
  TrendingUp,
  Sparkles,
  AlertCircle,
} from "lucide-react";

const insights = [
  {
    title: "High Hiring Activity",
    description: "Technology companies increased hiring by 18% this week.",
    confidence: "96%",
    icon: TrendingUp,
    color: "text-violet-600",
    bg: "bg-violet-100 dark:bg-violet-900/30",
  },
  {
    title: "Follow-up Recommended",
    description: "43 candidates are awaiting follow-up emails.",
    confidence: "91%",
    icon: Sparkles,
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    title: "Priority Leads",
    description: "5 high-value leads require immediate attention.",
    confidence: "88%",
    icon: AlertCircle,
    color: "text-orange-500",
    bg: "bg-orange-100 dark:bg-orange-900/30",
  },
];

const AIInsights = () => {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <h2 className="mb-8 text-2xl font-semibold text-slate-900 dark:text-white">
        AI Insights
      </h2>

      {/* Insights */}

      <div className="flex-1 space-y-5">

        {insights.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <div className="flex items-start gap-3">

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bg}`}
                >
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>

                <div className="flex-1">

                  <div className="flex items-center justify-between">

                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>

                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {item.confidence}
                    </span>

                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>

                </div>

              </div>
            </div>
          );
        })}

      </div>

    </div>
  );
};

export default AIInsights;