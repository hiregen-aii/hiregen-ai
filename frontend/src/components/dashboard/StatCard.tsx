import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string;
  growth: string;
  color: string;
  icon: LucideIcon;
}

const StatCard = ({
  title,
  value,
  growth,
  color,
  icon: Icon,
}: Props) => {
  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-[#111827]"
      style={{
        borderBottom: `4px solid ${color}`,
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {title}
          </h4>

          <h2
            className="mt-3 text-4xl font-bold"
            style={{ color }}
          >
            {value}
          </h2>

          <p className="mt-2 text-sm font-semibold text-green-500 dark:text-green-400">
            ↑ {growth}
          </p>
        </div>

        <div
          className="flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-300"
          style={{
            backgroundColor: `${color}20`,
          }}
        >
          <Icon
            size={22}
            style={{
              color,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default StatCard;