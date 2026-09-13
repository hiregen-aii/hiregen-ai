import {
  Award,
  BriefcaseBusiness,
  CalendarDays,
  Users,
} from "lucide-react";

import { useLeads } from "@/hooks/useLeads";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useCompanies } from "@/hooks/useCompanies";

const iconMap = {
  briefcase: BriefcaseBusiness,
  users: Users,
  calendar: CalendarDays,
  award: Award,
};

const getColorClasses = (color: string) => {

  switch (color) {

    case "purple":
      return {
        text: "text-violet-600",
        bg: "bg-violet-100 dark:bg-violet-900/30",
        border: "#8B5CF6",
        status: "Hiring Active",
      };

    case "green":
      return {
        text: "text-emerald-600",
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        border: "#10B981",
        status: "Completed",
      };

    case "blue":
      return {
        text: "text-blue-600",
        bg: "bg-blue-100 dark:bg-blue-900/30",
        border: "#3B82F6",
        status: "Running",
      };

    case "orange":
      return {
        text: "text-orange-600",
        bg: "bg-orange-100 dark:bg-orange-900/30",
        border: "#F97316",
        status: "Professional",
      };

    default:
      return {
        text: "text-slate-600",
        bg: "bg-slate-100 dark:bg-slate-800",
        border: "#64748B",
        status: "Updated",
      };

  }

};

const ProfileStats = () => {
  const { data: leads } = useLeads();
  const { data: campaigns } = useCampaigns();
  const { data: companies } = useCompanies();

  const realStats = [
    {
      id: 1,
      title: "Recruitments",
      value: leads?.length ?? 0,
      icon: "briefcase" as const,
      color: "purple",
      status: "Hiring Active",
    },
    {
      id: 2,
      title: "Interviews",
      value: leads?.filter((l) => l.stage === "MEETING_BOOKED" || l.stage === "REPLIED" || l.stage === "SENT").length ?? 0,
      icon: "users" as const,
      color: "green",
      status: "In Pipeline",
    },
    {
      id: 3,
      title: "Campaigns",
      value: campaigns?.filter((c) => c.status === "ACTIVE").length ?? (campaigns?.length ?? 0),
      icon: "calendar" as const,
      color: "blue",
      status: "Running",
    },
    {
      id: 4,
      title: "Companies",
      value: companies?.length ?? 0,
      icon: "award" as const,
      color: "orange",
      status: "Tracked",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {realStats.map((stat) => {

        const Icon = iconMap[stat.icon];

        const colors = getColorClasses(stat.color);

        return (

          <div
            key={stat.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-[#111827]"
            style={{
              borderBottom: `4px solid ${colors.border}`,
            }}
          >

            <div className="flex items-start justify-between">

              <div>

                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400">

                  {stat.title}

                </h4>

                <h2
                  className={`mt-3 text-4xl font-bold ${colors.text}`}
                >

                  {stat.value}

                </h2>

                <p className={`mt-2 text-sm font-semibold ${colors.text}`}>

                  ● {colors.status}

                </p>

              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${colors.bg}`}
              >

                <Icon
                  size={22}
                  className={colors.text}
                />

              </div>

            </div>

          </div>

        );

      })}

    </div>

  );

};

export default ProfileStats;