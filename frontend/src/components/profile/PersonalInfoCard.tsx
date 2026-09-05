import {
  Calendar,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import { useProfile } from "@/context/ProfileContext";

const PersonalInfoCard = () => {

  const { profile } = useProfile();

  return (

    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">

        <div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">

            Personal Information

          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

            View your personal details.

          </p>

        </div>

      </div>

      {/* Content */}

      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

                {/* Full Name */}

        <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

          <div className="rounded-xl bg-violet-100 p-3 dark:bg-violet-900/30">

            <User
              size={20}
              className="text-violet-600 dark:text-violet-400"
            />

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Full Name
            </p>

            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {profile.name}
            </h3>

          </div>

        </div>

        {/* Email */}

        <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

          <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">

            <Mail
              size={20}
              className="text-blue-600 dark:text-blue-400"
            />

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Email Address
            </p>

            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {profile.email}
            </h3>

          </div>

        </div>

        {/* Phone */}

        <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

          <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">

            <Phone
              size={20}
              className="text-green-600 dark:text-green-400"
            />

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Phone Number
            </p>

            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {profile.phone}
            </h3>

          </div>

        </div>

        {/* Date of Birth */}

        <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

          <div className="rounded-xl bg-orange-100 p-3 dark:bg-orange-900/30">

            <Calendar
              size={20}
              className="text-orange-600 dark:text-orange-400"
            />

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Date of Birth
            </p>

            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {profile.dob}
            </h3>

          </div>

        </div>

                {/* Gender */}

        <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

          <div className="rounded-xl bg-pink-100 p-3 dark:bg-pink-900/30">

            <User
              size={20}
              className="text-pink-600 dark:text-pink-400"
            />

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gender
            </p>

            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {profile.gender}
            </h3>

          </div>

        </div>

        {/* Address */}

        <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

          <div className="rounded-xl bg-red-100 p-3 dark:bg-red-900/30">

            <MapPin
              size={20}
              className="text-red-600 dark:text-red-400"
            />

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Address
            </p>

            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {profile.address}
            </h3>

          </div>

        </div>

        {/* City */}

        <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

          <div className="rounded-xl bg-cyan-100 p-3 dark:bg-cyan-900/30">

            <MapPin
              size={20}
              className="text-cyan-600 dark:text-cyan-400"
            />

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              City
            </p>

            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {profile.city}
            </h3>

          </div>

        </div>

        {/* State & Country */}

        <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

          <div className="rounded-xl bg-indigo-100 p-3 dark:bg-indigo-900/30">

            <MapPin
              size={20}
              className="text-indigo-600 dark:text-indigo-400"
            />

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              State & Country
            </p>

            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {profile.state}, {profile.country}
            </h3>

          </div>

        </div>

              </div>

    </div>

  );

};

export default PersonalInfoCard;