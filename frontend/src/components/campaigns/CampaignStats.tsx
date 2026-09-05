import {
  PlayCircle,
  PauseCircle,
  Megaphone,
  Users,
  TrendingUp,
} from "lucide-react";

import type { CampaignStats as CampaignStatsType } from "@/types/campaign";

interface CampaignStatsProps {
  stats: CampaignStatsType;
}

const CampaignStats = ({
  stats,
}: CampaignStatsProps) => {
  const cards = [
    {
      title: "Active Sequences",
      value: stats.activeSequences,
      change: "+8.2%",
      color: "#00C853",
      icon: PlayCircle,
    },
    {
      title: "Paused",
      value: stats.paused,
      change: "-1.3%",
      color: "#F59E0B",
      icon: PauseCircle,
    },
    {
      title: "Total Campaigns",
      value: stats.totalCampaigns,
      change: "+12.4%",
      color: "#7C3AED",
      icon: Megaphone,
    },
    {
      title: "Leads Enrolled",
      value: stats.leadsEnrolled,
      change: "+15.6%",
      color: "#2563EB",
      icon: Users,
    },
    {
      title: "Avg Reply Rate",
      value: `${stats.averageReplyRate}%`,
      change: "+3.8%",
      color: "#EC4899",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-[#111827]"
            style={{
              borderBottom: `4px solid ${card.color}`,
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {card.title}
                </h4>

                <h2
                  className="mt-3 text-4xl font-bold"
                  style={{
                    color: card.color,
                  }}
                >
                  {card.value}
                </h2>

                <p className="mt-2 text-sm font-semibold text-green-500 dark:text-green-400">
                  ↑ {card.change}
                </p>
              </div>

              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                  backgroundColor: `${card.color}20`,
                }}
              >
                <Icon
                  size={22}
                  style={{
                    color: card.color,
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

export default CampaignStats;