const funnelData = [
  {
    label: "Leads",
    value: 1248,
    width: "100%",
    color: "#7C3AED",
  },
  {
    label: "Qualified",
    value: 842,
    width: "72%",
    color: "#3B82F6",
  },
  {
    label: "Contacted",
    value: 526,
    width: "48%",
    color: "#8B5CF6",
  },
  {
    label: "Meetings",
    value: 189,
    width: "24%",
    color: "#22C55E",
  },
  {
    label: "Closed",
    value: 68,
    width: "10%",
    color: "#F59E0B",
  },
];

const HiringFunnel = () => {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      {/* Title */}

      <h2 className="mb-8 text-2xl font-semibold text-slate-900 dark:text-white">
        Hiring Funnel
      </h2>

      {/* Bars */}

      <div className="flex-1 space-y-8">

        {funnelData.map((item) => (

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
                style={{
                  width: item.width,
                  background: item.color,
                }}
              />

            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default HiringFunnel;