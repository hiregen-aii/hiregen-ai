import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";

const HiringType = () => {
  const { hiringType, isLoading, isError } = useDashboardData();

  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#111827]">
      <h2 className="mb-8 text-2xl font-semibold text-slate-900 dark:text-white">
        Hiring Type
      </h2>

      {isLoading && (
        <div className="mx-auto h-[260px] w-[260px] animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
      )}

      {isError && (
        <p className="text-sm text-slate-500 dark:text-slate-400">Couldn't load hiring type data.</p>
      )}

      {!isLoading && !isError && hiringType.total === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No leads with a hiring type set yet.
        </p>
      )}

      {!isLoading && !isError && hiringType.total > 0 && (
        <>
          <div className="relative flex justify-center">
            <div className="h-[260px] w-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hiringType.data}
                    dataKey="value"
                    innerRadius={70}
                    outerRadius={100}
                    stroke="none"
                    paddingAngle={4}
                  >
                    {hiringType.data.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 text-center">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                {hiringType.total}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
            </div>
          </div>

          <div className="mt-10 space-y-5">
            {hiringType.data.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-base font-medium text-slate-700 dark:text-slate-300">
                    {item.name}
                  </span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HiringType;