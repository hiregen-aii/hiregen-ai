import { useQuery } from "@tanstack/react-query";
import { Users, Mail, CalendarCheck, Clock } from "lucide-react";
import { api } from "@/services/api";

interface ActivityItem {
  id: string;
  type: "lead" | "email" | "meeting";
  description: string;
  company: string;
  timestamp: string;
}

const getActivityIcon = (type: ActivityItem["type"]) => {
  switch (type) {
    case "lead":
      return <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />;
    case "email":
      return <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    case "meeting":
      return <CalendarCheck className="h-4 w-4 text-green-600 dark:text-green-400" />;
    default:
      return <Clock className="h-4 w-4 text-slate-500" />;
  }
};

const formatTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
};

const RecentActivity = () => {
  const { data: activities, isLoading } = useQuery<ActivityItem[]>({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const { data } = await api.get("/analytics/activity");
      return data.data ?? [];
    },
    refetchInterval: 30000,
  });

  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#111827]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Recent Activity
        </h2>
        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
          Live
        </span>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      )}

      {!isLoading && (!activities || activities.length === 0) && (
        <div className="flex flex-1 flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
          <Clock className="mb-3 h-8 w-8" />
          <p className="text-sm font-medium">No recent activities</p>
        </div>
      )}

      {!isLoading && activities && activities.length > 0 && (
        <div className="space-y-3 overflow-y-auto max-h-[320px] pr-1">
          {activities.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition hover:bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-800/60"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-800">
                {getActivityIcon(item.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                  {item.description}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{item.company}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(item.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;