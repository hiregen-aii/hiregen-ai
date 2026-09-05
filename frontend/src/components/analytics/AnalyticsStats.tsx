import {
  Activity,
  Timer,
  Users,
  Search,
  Send,
  Mail,
  Reply,
  Calendar,
  Trophy,
  AlertTriangle,
} from "lucide-react";

import type { AnalyticsStat } from "@/types/analytics";

interface AnalyticsStatsProps {
  stats: AnalyticsStat[];
}

const AnalyticsStats = ({
  stats,
}: AnalyticsStatsProps) => {
  const getIcon = (icon: string) => {
    switch (icon) {
      case "signal":
        return Activity;

      case "timer":
        return Timer;

      case "users":
        return Users;

      case "search":
        return Search;

      case "send":
        return Send;

      case "mail":
        return Mail;

      case "reply":
        return Reply;

      case "calendar":
        return Calendar;

      case "trophy":
        return Trophy;

      case "alert":
        return AlertTriangle;

      default:
        return Activity;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">

      {stats.slice(0, 5).map((stat) => {
        const Icon = getIcon(stat.icon);

        return (
          <div
            key={stat.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-[#111827]"
            style={{
              borderBottom: `4px solid ${stat.color}`,
            }}
          >

            <div className="flex items-start justify-between">

              <div>

                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {stat.title}
                </h4>

                <h2
                  className="mt-3 text-4xl font-bold"
                  style={{
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </h2>

                <p
                  className={`mt-2 text-sm font-semibold ${
                    stat.trend === "up"
                      ? "text-green-500 dark:text-green-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {stat.trend === "up" ? "↑" : "↓"} {stat.change}
                </p>

              </div>

              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                  backgroundColor: `${stat.color}20`,
                }}
              >

                <Icon
                  size={22}
                  style={{
                    color: stat.color,
                  }}
                />

              </div>

            </div>

          </div>
        );
      })}

            {stats.slice(5).map((stat) => {
        const Icon = getIcon(stat.icon);

        return (
          <div
            key={stat.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-[#111827]"
            style={{
              borderBottom: `4px solid ${stat.color}`,
            }}
          >

            <div className="flex items-start justify-between">

              <div>

                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {stat.title}
                </h4>

                <h2
                  className="mt-3 text-4xl font-bold"
                  style={{
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </h2>

                <p
                  className={`mt-2 text-sm font-semibold ${
                    stat.trend === "up"
                      ? "text-green-500 dark:text-green-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {stat.trend === "up" ? "↑" : "↓"} {stat.change}
                </p>

              </div>

              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                  backgroundColor: `${stat.color}20`,
                }}
              >

                <Icon
                  size={22}
                  style={{
                    color: stat.color,
                  }}
                />

              </div>

            </div>

          </div>
        );
      })}

    </div>
  );
};

export default AnalyticsStats;