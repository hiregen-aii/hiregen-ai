import {
  Trophy,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import type {
  TeamPerformance,
} from "@/types/analytics";

interface TeamLeaderboardProps {
  team: TeamPerformance[];
}

const TeamLeaderboard = ({
  team,
}: TeamLeaderboardProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Team Leaderboard
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Team performance overview
          </p>

        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-900/30">

          <Trophy
            size={24}
            className="text-yellow-600"
          />

        </div>

      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="border-b border-slate-200 dark:border-slate-700">

            <tr>

              <th className="px-4 py-4 text-left text-sm font-semibold text-slate-500">
                Representative
              </th>

              <th className="px-4 py-4 text-center text-sm font-semibold text-slate-500">
                Leads
              </th>

              <th className="px-4 py-4 text-center text-sm font-semibold text-slate-500">
                Reply %
              </th>

              <th className="px-4 py-4 text-center text-sm font-semibold text-slate-500">
                Meetings
              </th>

              <th className="px-4 py-4 text-center text-sm font-semibold text-slate-500">
                Wins
              </th>

              <th className="px-4 py-4 text-center text-sm font-semibold text-slate-500">
                Trend
              </th>

            </tr>

          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">

            {team.map((member) => (

                              <tr
                key={member.id}
                className="transition hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <td className="px-4 py-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                      {member.avatar}
                    </div>

                    <div>

                      <p className="font-semibold text-slate-900 dark:text-white">
                        {member.rep}
                      </p>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Recruitment Specialist
                      </p>

                    </div>

                  </div>

                </td>

                <td className="px-4 py-5 text-center font-semibold text-slate-900 dark:text-white">
                  {member.leads}
                </td>

                <td className="px-4 py-5 text-center font-semibold text-blue-600">
                  {member.replyRate}%
                </td>

                <td className="px-4 py-5 text-center font-semibold text-violet-600">
                  {member.meetings}
                </td>

                <td className="px-4 py-5 text-center font-semibold text-green-600">
                  {member.wins}
                </td>

                <td className="px-4 py-5">

                  <div className="flex justify-center">

                    {member.trend === "up" ? (
                      <div className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-green-600 dark:bg-green-900/30 dark:text-green-300">

                        <TrendingUp size={16} />

                        <span className="text-sm font-semibold">
                          Up
                        </span>

                      </div>
                    ) : (
                      <div className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-red-600 dark:bg-red-900/30 dark:text-red-300">

                        <TrendingDown size={16} />

                        <span className="text-sm font-semibold">
                          Down
                        </span>

                      </div>
                    )}

                  </div>

                </td>

              </tr>
            ))}

            {team.length === 0 && (
              <tr>

                <td
                  colSpan={6}
                  className="px-6 py-16 text-center"
                >

                  <div className="flex flex-col items-center">

                    <div className="mb-4 rounded-full bg-slate-100 p-5 dark:bg-slate-800">

                      <Trophy
                        size={34}
                        className="text-slate-400"
                      />

                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      No Team Data Available
                    </h3>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      No performance data available.
                    </p>

                  </div>

                </td>

              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default TeamLeaderboard;