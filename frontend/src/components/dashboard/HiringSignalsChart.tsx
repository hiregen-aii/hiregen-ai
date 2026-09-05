import { useState } from "react";
import { useTheme } from "next-themes";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const weeklyData = [
  { day: "Mon", value: 120 },
  { day: "Tue", value: 145 },
  { day: "Wed", value: 138 },
  { day: "Thu", value: 176 },
  { day: "Fri", value: 195 },
  { day: "Sat", value: 118 },
  { day: "Sun", value: 105 },
];

const monthlyData = [
  { day: "W1", value: 430 },
  { day: "W2", value: 510 },
  { day: "W3", value: 470 },
  { day: "W4", value: 590 },
];

const quarterlyData = [
  { day: "Jan", value: 1200 },
  { day: "Feb", value: 1450 },
  { day: "Mar", value: 1720 },
];

const HiringSignalsChart = () => {
  const [tab, setTab] = useState("Weekly");

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const data =
    tab === "Weekly"
      ? weeklyData
      : tab === "Monthly"
      ? monthlyData
      : quarterlyData;

  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <div className="mb-6 flex items-center justify-between">

        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Hiring Signals This Week
        </h2>

        <span className="rounded-full bg-violet-100 px-4 py-1 text-sm font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
          ● Live
        </span>

      </div>

      {/* Tabs */}

      <div className="mb-6 inline-flex rounded-2xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-[#1E293B]">

        {["Weekly", "Monthly", "Quarterly"].map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded-xl px-5 py-2 text-sm transition-all duration-300 ${
              tab === item
                ? "bg-white font-semibold text-violet-600 shadow dark:bg-[#334155] dark:text-violet-300"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {item}
          </button>
        ))}

      </div>

      {/* Chart */}

      <div className="rounded-2xl border border-slate-200 bg-[#FAFAFC] p-4 dark:border-slate-700 dark:bg-[#0F172A]">

        <ResponsiveContainer width="100%" height={300}>

          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >

            <CartesianGrid
              stroke={isDark ? "#374151" : "#E5E7EB"}
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              stroke={isDark ? "#94A3B8" : "#64748B"}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              stroke={isDark ? "#94A3B8" : "#64748B"}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              cursor={{
                stroke: "#7C3AED",
                strokeWidth: 1,
              }}
              contentStyle={{
                borderRadius: 16,
                border: "none",
                background: isDark ? "#111827" : "#ffffff",
                color: isDark ? "#ffffff" : "#000000",
                boxShadow: "0 10px 25px rgba(0,0,0,.12)",
              }}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#7C3AED"
              strokeWidth={3}
              dot={{
                r: 6,
                fill: "#7C3AED",
                stroke: "#fff",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 8,
                fill: "#7C3AED",
                stroke: "#fff",
                strokeWidth: 3,
              }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      {/* Footer */}

      <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
        Daily hiring signals across the current week.
      </p>

    </div>
  );
};

export default HiringSignalsChart;