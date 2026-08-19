import {
  PieChart,
} from "lucide-react";

import type {
  HiringTypeMix,
} from "@/types/analytics";

interface HiringTypeChartProps {
  data: HiringTypeMix[];
}

const HiringTypeChart = ({
  data,
}: HiringTypeChartProps) => {
  const total = data.reduce(
    (sum, item) => sum + item.value,
    0
  );

  let cumulative = 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Hiring Type Mix
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Distribution of hiring campaigns
          </p>

        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">

          <PieChart
            size={24}
            className="text-violet-600"
          />

        </div>

      </div>

      <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">

        {/* Donut Chart */}

        <div className="relative flex items-center justify-center">

          <svg
            width="240"
            height="240"
            viewBox="0 0 240 240"
            className="-rotate-90"
          >

            {data.map((item, index) => {
              const radius = 85;
              const circumference =
                2 * Math.PI * radius;

              const dash =
                (item.value / total) *
                circumference;

              const gap =
                circumference - dash;

              const offset =
                -(
                  cumulative / total
                ) * circumference;

              cumulative += item.value;

              return (
                <circle
                  key={index}
                  cx="120"
                  cy="120"
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="24"
                  strokeDasharray={`${dash} ${gap}`}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                />
              );
            })}

          </svg>

          <div className="absolute text-center">

            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
              {total.toFixed(0)}%
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Total Mix
            </p>

          </div>

        </div>

        {/* Legend */}

        <div className="flex-1 space-y-4">

          {data.map((item) => (

            <div
              key={item.name}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700"
            >

              <div className="flex items-center gap-3">

                <span
                  className="h-4 w-4 rounded-full"
                  style={{
                    backgroundColor:
                      item.color,
                  }}
                />

                <span className="font-medium text-slate-900 dark:text-white">
                  {item.name}
                </span>

              </div>

              <span
                className="font-bold"
                style={{
                  color: item.color,
                }}
              >
                {item.value}%
              </span>

            </div>

          ))}

                  </div>

      </div>

      {/* Summary */}

      <div className="mt-8 rounded-2xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-800 dark:bg-violet-900/20">

        <h3 className="text-lg font-bold text-violet-700 dark:text-violet-300">
          Hiring Mix Summary
        </h3>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Top Hiring Type */}

          <div className="rounded-xl bg-white p-4 dark:bg-slate-900">

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Top Hiring Type
            </p>

            <h4
              className="mt-2 text-xl font-bold"
              style={{
                color: data[0].color,
              }}
            >
              {data[0].name}
            </h4>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {data[0].value}% of campaigns
            </p>

          </div>

          {/* Total Hiring Types */}

          <div className="rounded-xl bg-white p-4 dark:bg-slate-900">

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Hiring Categories
            </p>

            <h4 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
              {data.length}
            </h4>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Active categories
            </p>

          </div>

          {/* Coverage */}

          <div className="rounded-xl bg-white p-4 dark:bg-slate-900">

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Campaign Coverage
            </p>

            <h4 className="mt-2 text-xl font-bold text-green-600">
              100%
            </h4>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Distribution tracked
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default HiringTypeChart;