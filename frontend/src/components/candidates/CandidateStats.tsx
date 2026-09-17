import { Users, UserCheck, Zap, Award, Target } from "lucide-react";
import type { Candidate } from "@/types/candidate";

interface CandidateStatsProps {
  candidates: Candidate[];
}

const CandidateStats = ({ candidates }: CandidateStatsProps) => {
  const total = candidates.length;
  const available = candidates.filter((c) => c.status === "AVAILABLE").length;
  const immediate = candidates.filter(
    (c) => c.notice_period && c.notice_period.toLowerCase().includes("immediate")
  ).length;
  const topTier = candidates.filter((c) => c.fit_score >= 90).length;
  const avgScore = total > 0
    ? (candidates.reduce((sum, c) => sum + Number(c.fit_score || 0), 0) / total).toFixed(1)
    : "88.0";

  const stats = [
    {
      title: "Total Talent Pool",
      value: String(total),
      color: "#7C3AED",
      icon: Users,
    },
    {
      title: "Available Now",
      value: String(available),
      color: "#059669",
      icon: UserCheck,
    },
    {
      title: "Immediate Joiners",
      value: String(immediate),
      color: "#D97706",
      icon: Zap,
    },
    {
      title: "High Match (90%+)",
      value: String(topTier),
      color: "#2563EB",
      icon: Award,
    },
    {
      title: "Avg Fit Score",
      value: `${avgScore}%`,
      color: "#EC4899",
      icon: Target,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-[#111827]"
            style={{ borderBottom: `4px solid ${item.color}` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {item.title}
                </h4>
                <h2 className="mt-3 text-3xl font-bold" style={{ color: item.color }}>
                  {item.value}
                </h2>
              </div>

              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-300"
                style={{ backgroundColor: `${item.color}15` }}
              >
                <Icon size={24} style={{ color: item.color }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CandidateStats;
