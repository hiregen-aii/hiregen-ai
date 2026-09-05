import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";

const HiringFunnel = () => {
  const { funnel, isLoading, isError } = useDashboardData();

  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#111827]">
      <h2 className="mb-8 text-2xl font-semibold text-slate-900 dark:text-white">
        Hiring Funnel
      </h2>

      {isLoading && (
        <div className="flex-1 space-y-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-slate-500 dark:text-slate-400">Couldn't load funnel data.</p>
      )}

      {!isLoading && !isError && (
        <div className="flex-1 space-y-8">
          {funnel.map((item) => (
            <div key={item.label}>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-[17px] font-medium text-slate-800 dark:text-slate-200">
                  {item.label}
                </h4>
                <span className="text-[17px] font-semibold text-slate-900 dark:text-white">
                  {item.value}
                </span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: item.width, background: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HiringFunnel;