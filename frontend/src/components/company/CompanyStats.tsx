import {
  Building2,
  Users,
  FileText,
  TrendingUp,
} from "lucide-react";

import type { Company } from "@/types/company";

interface CompanyStatsProps {
  company: Company;
}

const CompanyStats = ({ company }: CompanyStatsProps) => {
  const stats = [
    {
      title: "Employees",
      value: company.stats.employees,
      change: "+8.5%",
      color: "#2563EB",
      icon: Users,
    },
    {
      title: "Companies",
      value: company.stats.companies,
      change: "+12.2%",
      color: "#7C3AED",
      icon: Building2,
    },
    {
      title: "Documents",
      value: company.stats.documents,
      change: "+4.8%",
      color: "#F59E0B",
      icon: FileText,
    },
    {
      title: "Hiring Progress",
      value: `${company.stats.hiringProgress}%`,
      change: "+6.3%",
      color: "#00C853",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-[#111827]"
            style={{
              borderBottom: `4px solid ${item.color}`,
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {item.title}
                </h4>

                <h2
                  className="mt-3 text-4xl font-bold"
                  style={{
                    color: item.color,
                  }}
                >
                  {item.value}
                </h2>

                <p className="mt-2 text-sm font-semibold text-green-500 dark:text-green-400">
                  ↑ {item.change}
                </p>
              </div>

              <div
                className="flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-300"
                style={{
                  backgroundColor: `${item.color}20`,
                }}
              >
                <Icon
                  size={22}
                  style={{
                    color: item.color,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CompanyStats;