import { Activity, Users, Send, MailCheck, CalendarCheck, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import StatCard from "./StatCard";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";

const ICONS: Record<string, LucideIcon> = {
  "Hiring Signals": Activity,
  "Leads Generated": Users,
  "Emails Sent": Send,
  "Replies Received": MailCheck,
  "Meetings Booked": CalendarCheck,
  "Conversion Rate": BarChart3,
};

const StatsGrid = () => {
  const { stats, isLoading, isError, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="grid gap-5 xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[132px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
        Couldn't load dashboard stats: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2">
      {stats.map((item) => (
        <StatCard
          key={item.title}
          title={item.title}
          value={item.available ? item.value : "—"}
          color={item.color}
          icon={ICONS[item.title]}
        />
      ))}
    </div>
  );
};

export default StatsGrid;