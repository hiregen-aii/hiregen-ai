import { useQuery } from "@tanstack/react-query";
import { Trophy, UserCheck } from "lucide-react";
import { api } from "@/services/api";

interface TeamMemberMetric {
  id: string;
  name: string;
  role: string;
  email: string;
  leads_managed: number;
  emails_sent: number;
  meetings_booked: number;
  conversion_rate: number;
}

const TeamPerformance = () => {
  const { data: teamMembers, isLoading } = useQuery<TeamMemberMetric[]>({
    queryKey: ["team-performance"],
    queryFn: async () => {
      const { data } = await api.get("/analytics/team");
      return data.data ?? [];
    },
  });

  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#111827]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Team Performance
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Recruiter productivity</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30">
          <Trophy className="h-6 w-6 text-violet-600 dark:text-violet-300" />
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      )}

      {!isLoading && (!teamMembers || teamMembers.length === 0) && (
        <div className="flex flex-1 flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
          <UserCheck className="mb-3 h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium">No team members active</p>
        </div>
      )}

      {!isLoading && teamMembers && teamMembers.length > 0 && (
        <div className="space-y-3 overflow-y-auto max-h-[320px] pr-1">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-900/50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/40 dark:text-violet-300">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                    {member.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{member.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {member.leads_managed}
                  </p>
                  <p className="text-[10px] text-slate-400">Leads</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-green-600 dark:text-green-400">
                    {member.conversion_rate}%
                  </p>
                  <p className="text-[10px] text-slate-400">Conv.</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamPerformance;