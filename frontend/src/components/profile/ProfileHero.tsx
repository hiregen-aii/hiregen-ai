import {
  Camera,
  Edit,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useProfile } from "@/context/ProfileContext";

interface ProfileHeroProps {
  onEdit: () => void;
  onUploadPhoto: () => void;
}

const ProfileHero = ({
  onEdit,
  onUploadPhoto,
}: ProfileHeroProps) => {

  const { profile } = useProfile();

  return (

    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      <div className="flex flex-col gap-8 p-8 lg:flex-row lg:items-center lg:justify-between">

        {/* Left */}

        <div className="flex flex-col items-center gap-6 sm:flex-row">

          {/* Avatar */}

<div className="relative">

  <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-violet-100 shadow-lg dark:border-slate-700 dark:bg-violet-900">

    {profile.profileImage ? (

      <img
        src={profile.profileImage}
        alt={profile.name}
        className="h-full w-full object-cover"
      />

    ) : (

      <span className="text-5xl font-bold text-violet-700 dark:text-violet-300">

        {profile.name.charAt(0).toUpperCase()}

      </span>

    )}

  </div>

  <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full border-4 border-white bg-green-500 dark:border-[#111827]" />

</div>
          {/* User Info */}

          <div className="space-y-3 text-center sm:text-left">

            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">

              {profile.name}

            </h1>

            <p className="text-xl font-semibold text-violet-600">

              {profile.designation}

            </p>

            <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 sm:justify-start">

              <Mail size={18} />

              <span>{profile.email}</span>

            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-400">

              <ShieldCheck size={16} />

              Online

            </div>

          </div>

        </div>

                {/* Right */}

        <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">

          <button
            onClick={onUploadPhoto}
            className="flex items-center justify-center gap-3 rounded-xl bg-violet-600 px-6 py-4 font-semibold text-white transition-all duration-300 hover:bg-violet-700 hover:shadow-lg"
          >

            <Camera size={20} />

            Upload Photo

          </button>

          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-3 rounded-xl border border-violet-600 px-6 py-4 font-semibold text-violet-600 transition-all duration-300 hover:bg-violet-50 dark:border-violet-500 dark:text-violet-400 dark:hover:bg-violet-900/20"
          >

            <Edit size={20} />

            Edit Profile

          </button>

        </div>

      </div>

      {/* Divider */}

      <div className="border-t border-slate-200 dark:border-slate-700" />

      {/* Quick Information */}

      <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4 xl:grid-cols-8">

                <InfoCard
          title="Department"
          value={profile.department}
        />

        <InfoCard
          title="Employee ID"
          value={profile.employeeId}
        />

        <InfoCard
          title="Phone"
          value={profile.phone}
        />

        <InfoCard
          title="Work Location"
          value={profile.workLocation}
        />

        <InfoCard
          title="Country"
          value={profile.country}
        />

        <InfoCard
          title="Joined"
          value={new Date(profile.joiningDate).toLocaleDateString(
            "en-IN",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }
          )}
        />

        <InfoCard
          title="Employment"
          value={profile.employmentType}
        />

        <InfoCard
          title="Manager"
          value={profile.manager}
        />

      </div>

    </div>

  );

};

interface InfoCardProps {
  title: string;
  value: string;
}

const InfoCard = ({
  title,
  value,
}: InfoCardProps) => (

  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:border-violet-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">

    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">

      {title}

    </p>

    <p className="break-words text-base font-semibold text-slate-900 dark:text-white">

      {value}

    </p>

  </div>

);

export default ProfileHero;