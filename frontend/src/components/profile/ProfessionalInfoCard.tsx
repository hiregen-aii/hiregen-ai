import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  MapPin,
  UserCheck,
} from "lucide-react";

import { useProfile } from "@/context/ProfileContext";

const ProfessionalInfoCard = () => {

  const { profile } = useProfile();

  return (

    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">

        <div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">

            Professional Information

          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

            View your employment and work details.

          </p>

        </div>

      </div>

      {/* Content */}

      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

                {/* Employee ID */}

        <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

          <div className="rounded-xl bg-violet-100 p-3 dark:bg-violet-900/30">

            <BadgeCheck
              size={20}
              className="text-violet-600 dark:text-violet-400"
            />

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Employee ID
            </p>

            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {profile.employeeId}
            </h3>

          </div>

        </div>

        {/* Designation */}

        <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

          <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">

            <BriefcaseBusiness
              size={20}
              className="text-blue-600 dark:text-blue-400"
            />

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Designation
            </p>

            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {profile.designation}
            </h3>

          </div>

        </div>

        {/* Department */}

        <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

          <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">

            <Building2
              size={20}
              className="text-green-600 dark:text-green-400"
            />

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Department
            </p>

            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {profile.department}
            </h3>

          </div>

        </div>

        {/* Reporting Manager */}

        <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

          <div className="rounded-xl bg-orange-100 p-3 dark:bg-orange-900/30">

            <UserCheck
              size={20}
              className="text-orange-600 dark:text-orange-400"
            />

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Reporting Manager
            </p>

            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {profile.manager}
            </h3>

          </div>

        </div>

                {/* Joining Date */}

        <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

          <div className="rounded-xl bg-cyan-100 p-3 dark:bg-cyan-900/30">

            <BadgeCheck
              size={20}
              className="text-cyan-600 dark:text-cyan-400"
            />

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Joining Date
            </p>

            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {profile.joiningDate}
            </h3>

          </div>

        </div>

        {/* Work Location */}

        <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

          <div className="rounded-xl bg-red-100 p-3 dark:bg-red-900/30">

            <MapPin
              size={20}
              className="text-red-600 dark:text-red-400"
            />

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Work Location
            </p>

            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {profile.workLocation}
            </h3>

          </div>

        </div>

        {/* Employment Type */}

        <div className="md:col-span-2">

          <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

            <div className="rounded-xl bg-indigo-100 p-3 dark:bg-indigo-900/30">

              <BriefcaseBusiness
                size={20}
                className="text-indigo-600 dark:text-indigo-400"
              />

            </div>

            <div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Employment Type
              </p>

              <span className="mt-2 inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">

                {profile.employmentType}

              </span>

            </div>

          </div>

        </div>

              </div>

    </div>

  );

};

export default ProfessionalInfoCard;