import { Trophy, TrendingUp } from "lucide-react";

const recruiters = [
  {
    name: "Sarah Wilson",
    role: "Senior Recruiter",
    score: 96,
    leads: 184,
    color: "bg-violet-500",
  },
  {
    name: "John Carter",
    role: "Talent Acquisition",
    score: 89,
    leads: 162,
    color: "bg-blue-500",
  },
  {
    name: "Emma Davis",
    role: "HR Specialist",
    score: 82,
    leads: 143,
    color: "bg-green-500",
  },
];

const TeamPerformance = () => {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <div className="mb-8 flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Team Performance
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Recruiter productivity
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30">
          <Trophy className="h-6 w-6 text-violet-600 dark:text-violet-300" />
        </div>

      </div>

      {/* Members */}

      <div className="flex-1 space-y-6">

        {recruiters.map((member) => (
          <div key={member.name}>

            <div className="mb-3 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white ${member.color}`}
                >
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>

                <div>

                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {member.name}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {member.role}
                  </p>

                </div>

              </div>

              <span className="font-bold text-violet-600 dark:text-violet-300">
                {member.score}%
              </span>

            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">

              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500"
                style={{
                  width: `${member.score}%`,
                }}
              />

            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">

              <span>{member.leads} Leads Closed</span>

              <div className="flex items-center gap-1 text-green-500">

                <TrendingUp className="h-3.5 w-3.5" />

                +8%

              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
};

export default TeamPerformance;