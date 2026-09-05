import {
  Camera,
  Clock3,
  Sparkles,
  UserCircle2,
} from "lucide-react";

import { useProfile } from "@/context/ProfileContext";

const iconMap = {
  profile: UserCircle2,
  photo: Camera,
  skill: Sparkles,
  professional: Clock3,
};

const iconColors = {
  profile:
    "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",

  photo:
    "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",

  skill:
    "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",

  professional:
    "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
};

const RecentActivity = () => {
const { activities } = useProfile();
  return (

    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">

        <div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">

            Recent Activity

          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

            Track your latest profile updates and activities.

          </p>

        </div>

      </div>

      {/* Timeline */}

      <div className="p-6">

                {activities.map((activity, index) => {

          const Icon = iconMap[activity.type];

          const iconColor = iconColors[activity.type];

          return (

            <div
              key={activity.id}
              className="relative flex gap-4 pb-8 last:pb-0"
            >

              {/* Timeline Line */}

              {index !== activities.length - 1 && (

                <div className="absolute left-6 top-14 h-full w-0.5 bg-slate-200 dark:bg-slate-700" />

              )}

              {/* Icon */}

              <div
                className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full ${iconColor}`}
              >

                <Icon size={20} />

              </div>

              {/* Activity Card */}

              <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-all duration-300 hover:border-violet-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-violet-700">

                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">

                    {activity.title}

                  </h3>

                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">

                    {activity.time}

                  </span>

                </div>

                <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">

                  {activity.description}

                </p>

              </div>

            </div>

          );

        })}

                {/* Footer */}

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">

                Total Activities

              </p>

              <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">

                {activities.length}

              </h3>

            </div>

            <div className="max-w-xl">

              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">

                Your recent profile updates are displayed here. Editing your
                profile, uploading a new profile photo, updating professional
                information, or modifying your skills will automatically add a
                new activity to this timeline.

              </p>

            </div>

          </div>

        </div>

              </div>

    </div>

  );

};

export default RecentActivity;