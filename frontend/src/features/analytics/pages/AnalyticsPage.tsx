import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

import { useDailyAnalytics, useMonthlyAnalytics } from "@/hooks/useAnalytics";
import { useAuthStore } from "@/store/auth-store";

// Normalized shape both daily and monthly rows map into — avoids mixing
// report_date/report_month (different field names) in the same array type.
interface ChartRow {
  label: string;
  total_leads: number;
  emails_sent: number;
  meetings_booked: number;
}

const AnalyticsPage = () => {
  const role = useAuthStore((s) => s.user?.role);
  const canView = role === "ADMIN" || role === "MANAGER";
  const [view, setView] = useState<"daily" | "monthly">("daily");

  const dailyQuery = useDailyAnalytics();
  const monthlyQuery = useMonthlyAnalytics();

  const activeQuery = view === "daily" ? dailyQuery : monthlyQuery;

  if (!canView) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-[#111827]">
        <p className="text-slate-500 dark:text-slate-400">
          Analytics is only available to ADMIN and MANAGER roles.
        </p>
      </div>
    );
  }

  const chartData: ChartRow[] =
    view === "daily"
      ? (dailyQuery.data ?? []).map((d) => ({
          label: d.report_date,
          total_leads: d.total_leads,
          emails_sent: d.emails_sent,
          meetings_booked: d.meetings_booked,
        }))
      : (monthlyQuery.data ?? []).map((d) => ({
          label: d.report_month,
          total_leads: d.total_leads,
          emails_sent: d.emails_sent,
          meetings_booked: d.meetings_booked,
        }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Hiring pipeline performance over time.</p>
        </div>
        <div className="flex gap-2">
          {(["daily", "monthly"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                view === v
                  ? "bg-violet-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {v === "daily" ? "Daily" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      {activeQuery.isLoading && (
        <div className="h-80 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
      )}

      {activeQuery.isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {activeQuery.error instanceof Error ? activeQuery.error.message : "Failed to load analytics"}
        </div>
      )}

      {!activeQuery.isLoading && !activeQuery.isError && chartData.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-14 text-center dark:border-slate-700 dark:bg-[#111827]">
          <TrendingUp className="mb-3 h-8 w-8 text-slate-300" />
          <p className="text-slate-500 dark:text-slate-400">
            No {view} analytics rows yet — these are populated by a rollup job, not live-computed.
          </p>
        </div>
      )}

      {!activeQuery.isLoading && !activeQuery.isError && chartData.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-[#111827]">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="total_leads" name="Total Leads" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                <Bar dataKey="emails_sent" name="Emails Sent" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="meetings_booked" name="Meetings Booked" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;