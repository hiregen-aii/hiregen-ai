import {
  CheckCircle2,
  Clock3,
  Target,
  TrendingUp,
} from "lucide-react";

interface HiringProgressProps {
  progress: number;
}

const HiringProgress = ({
  progress,
}: HiringProgressProps) => {
  const completed = Math.round((progress / 100) * 24);
  const remaining = 24 - completed;

  const stats = [
    {
      title: "Completed",
      value: completed,
      color: "#16A34A",
      bg: "#DCFCE7",
      icon: CheckCircle2,
    },
    {
      title: "Remaining",
      value: remaining,
      color: "#F59E0B",
      bg: "#FEF3C7",
      icon: Clock3,
    },
    {
      title: "Target",
      value: 24,
      color: "#2563EB",
      bg: "#DBEAFE",
      icon: Target,
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#111827]">
      {/* Header */}

      <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Hiring Progress
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Overall hiring performance for this company.
        </p>
      </div>

      {/* Progress */}

      <div className="p-6">

        <div className="flex items-center justify-between">

          <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            Progress
          </span>

          <span className="text-3xl font-bold text-green-600">
            {progress}%
          </span>

        </div>

        <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">

          <div
            className="h-full rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 transition-all duration-700"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">

          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 p-4 text-center dark:border-slate-700"
              >

                <div
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: item.bg,
                  }}
                >
                  <Icon
                    size={22}
                    style={{
                      color: item.color,
                    }}
                  />
                </div>

                <h3
                  className="mt-3 text-2xl font-bold"
                  style={{
                    color: item.color,
                  }}
                >
                  {item.value}
                </h3>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {item.title}
                </p>

              </div>
            );
          })}

        </div>

        <div className="mt-8 rounded-2xl bg-green-50 p-5 dark:bg-green-900/20">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-800/40">
              <TrendingUp
                size={22}
                className="text-green-600"
              />
            </div>

            <div>

              <h3 className="font-semibold text-slate-900 dark:text-white">
                Performance Insight
              </h3>

              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Your hiring workflow is performing well. Current completion rate is{" "}
                <span className="font-semibold text-green-600">
                  {progress}%
                </span>
                , indicating strong recruitment progress.
              </p>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default HiringProgress;