import { Users, PhoneCall, MailCheck, CalendarCheck, Trophy } from "lucide-react";
import type { EnrichedLead } from "@/features/leads/hooks/useEnrichedLeads";

interface LeadStatsProps {
  leads: EnrichedLead[];
}

const LeadStats = ({ leads }: LeadStatsProps) => {
  const stats = [
    {
      title: "Total Leads",
      value: String(leads.length),
      color: "#7C3AED",
      icon: Users,
    },
    {
      title: "Contacted",
      value: String(leads.filter((l) => ["SENT", "REPLIED", "MEETING_BOOKED", "WON"].includes(l.stage)).length),
      color: "#2563EB",
      icon: PhoneCall,
    },
    {
      title: "Replied",
      value: String(leads.filter((l) => ["REPLIED", "MEETING_BOOKED", "WON"].includes(l.stage)).length),
      color: "#00C853",
      icon: MailCheck,
    },
    {
      title: "Meetings",
      value: String(leads.filter((l) => ["MEETING_BOOKED", "WON"].includes(l.stage)).length),
      color: "#FF6D00",
      icon: CalendarCheck,
    },
    {
      title: "Client Won",
      value: String(leads.filter((l) => l.stage === "WON").length),
      color: "#EC4899",
      icon: Trophy,
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
                <h2 className="mt-3 text-4xl font-bold" style={{ color: item.color }}>
                  {item.value}
                </h2>
              </div>

              <div
                className="flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-300"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <Icon size={22} style={{ color: item.color }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeadStats;