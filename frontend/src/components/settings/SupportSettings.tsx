import {
  Clock3,
  Headphones,
  Mail,
  Phone,
} from "lucide-react";

import { useSettings } from "@/context/SettingsContext";

const SupportSettings = () => {

  const { settings } = useSettings();

  return (

    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <div className="border-b border-slate-200 p-6 dark:border-slate-700">

        <div className="flex items-center gap-4">

          <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-900/30">

            <Headphones
              size={22}
              className="text-emerald-600 dark:text-emerald-400"
            />

          </div>

          <div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">

              Support

            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

              Contact our support team whenever you need assistance.

            </p>

          </div>

        </div>

      </div>

      {/* Content */}

      <div className="grid gap-5 p-6 md:grid-cols-3">

        {/* Email */}

        <a
          href={`mailto:${settings.support.email}`}
          className="group rounded-2xl border border-slate-200 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg dark:border-slate-700"
        >

          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">

            <Mail
              size={24}
              className="text-blue-600 dark:text-blue-400"
            />

          </div>

          <h3 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white">

            Email Support

          </h3>

          <p className="mt-2 break-all text-sm text-slate-500 dark:text-slate-400">

            {settings.support.email}

          </p>

          <p className="mt-4 text-sm font-medium text-blue-600">

            Open Email App →

          </p>

        </a>

        {/* Phone */}

        <a
          href={`tel:${settings.support.phone}`}
          className="group rounded-2xl border border-slate-200 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-lg dark:border-slate-700"
        >

          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">

            <Phone
              size={24}
              className="text-emerald-600 dark:text-emerald-400"
            />

          </div>

          <h3 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-emerald-600 dark:text-white">

            Phone Support

          </h3>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">

            {settings.support.phone}

          </p>

          <p className="mt-4 text-sm font-medium text-emerald-600">

            Open Dialer →

          </p>

        </a>

        {/* Working Hours */}

        <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">

          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">

            <Clock3
              size={24}
              className="text-orange-600 dark:text-orange-400"
            />

          </div>

          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">

            Working Hours

          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">

            {settings.support.workingHours}

          </p>

          <div className="mt-4 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">

            Online

          </div>

        </div>

              </div>

    </div>

  );

};

export default SupportSettings;