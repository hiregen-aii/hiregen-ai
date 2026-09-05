import {
  Users,
  Building2,
  ShieldCheck,
  Activity,
  Clock3,
} from "lucide-react";

import type {
  AdminStat,
} from "@/types/administration";

interface AdministrationStatsProps {
  stats: AdminStat[];
}

const AdministrationStats = ({
  stats,
}: AdministrationStatsProps) => {

  const getIcon = (icon: string) => {
    switch (icon) {

      case "users":
        return Users;

      case "building":
        return Building2;

      case "shield":
        return ShieldCheck;

      case "activity":
        return Activity;

      case "clock":
        return Clock3;

      default:
        return Users;
    }
  };

  const getColorClasses = (
    color: string
  ) => {

    switch (color) {

      case "purple":
        return {
          text: "text-violet-600",
          bg: "bg-violet-100 dark:bg-violet-900/30",
          border: "#8B5CF6",
        };

      case "green":
        return {
          text: "text-emerald-600",
          bg: "bg-emerald-100 dark:bg-emerald-900/30",
          border: "#10B981",
        };

      case "red":
        return {
          text: "text-red-600",
          bg: "bg-red-100 dark:bg-red-900/30",
          border: "#EF4444",
        };

      case "blue":
        return {
          text: "text-blue-600",
          bg: "bg-blue-100 dark:bg-blue-900/30",
          border: "#3B82F6",
        };

      case "indigo":
        return {
          text: "text-indigo-600",
          bg: "bg-indigo-100 dark:bg-indigo-900/30",
          border: "#6366F1",
        };

      default:
        return {
          text: "text-slate-600",
          bg: "bg-slate-100 dark:bg-slate-800",
          border: "#64748B",
        };
    }

  };

  return (

    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">

      {stats.map((stat) => {

        const Icon = getIcon(stat.icon);

        const colors =
          getColorClasses(stat.color);

        return (
          <div
            key={stat.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-[#111827]"
            style={{
              borderBottom: `4px solid ${colors.border}`,
            }}
          >

                        <div className="flex items-start justify-between">

              <div>

                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {stat.title}
                </h4>

                <h2
                  className={`mt-3 text-4xl font-bold ${colors.text}`}
                >
                  {stat.value.toLocaleString()}
                </h2>

                <p className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  ↑ Live Data
                </p>

              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${colors.bg}`}
              >

                <Icon
                  size={22}
                  className={colors.text}
                />

              </div>

            </div>

          </div>
        );

      })}

    </div>

  );
};

export default AdministrationStats;