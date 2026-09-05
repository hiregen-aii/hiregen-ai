import { useState } from "react";

import {
  Check,
  Monitor,
  Moon,
  Palette,
  Sun,
} from "lucide-react";

import { useTheme } from "next-themes";

import { useSettings } from "@/context/SettingsContext";
import { useNotifications } from "@/context/NotificationContext";
import type { ThemeMode } from "@/types/settings";

const AppearanceSettings = () => {

  const {
    settings,
    updateAppearance,
  } = useSettings();

  const {
    addNotification,
  } = useNotifications();

  const {
    theme,
    setTheme,
  } = useTheme();

  const [selectedTheme, setSelectedTheme] =
    useState<ThemeMode>(
      (theme as ThemeMode) ??
        settings.appearance.theme
    );

  const themeOptions = [
    {
      value: "light" as ThemeMode,
      title: "Light",
      description:
        "Use a bright interface for daytime work.",
      icon: Sun,
      iconColor: "text-amber-500",
    },
    {
      value: "dark" as ThemeMode,
      title: "Dark",
      description:
        "Reduce eye strain with a dark interface.",
      icon: Moon,
      iconColor: "text-indigo-500",
    },
    {
      value: "system" as ThemeMode,
      title: "System",
      description:
        "Automatically follow your system theme.",
      icon: Monitor,
      iconColor: "text-sky-500",
    },
  ];

  return (

    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <div className="border-b border-slate-200 p-6 dark:border-slate-700">

        <div className="flex items-center gap-4">

          <div className="rounded-xl bg-violet-100 p-3 dark:bg-violet-900/30">

            <Palette
              size={22}
              className="text-violet-600 dark:text-violet-400"
            />

          </div>

          <div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">

              Appearance

            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

              Choose how HireGen AI looks across the application.

            </p>

          </div>

        </div>

      </div>

      {/* Content */}

      <div className="grid gap-5 p-6 md:grid-cols-3">

        {themeOptions.map((option) => {

          const Icon = option.icon;

          const active =
            selectedTheme === option.value;

          return (

            <button
              key={option.value}
              onClick={() =>
                setSelectedTheme(option.value)
              }
              className={`rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                active
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                  : "border-slate-200 hover:border-violet-300 dark:border-slate-700"
              }`}
            >

              <div className="mb-5 flex items-center justify-between">

                <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">

                  <Icon
                    size={24}
                    className={option.iconColor}
                  />

                </div>

                {active && (

                  <Check
                    size={20}
                    className="text-violet-600"
                  />

                )}

              </div>

              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">

                {option.title}

              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">

                {option.description}

              </p>

            </button>

          );

        })}

                {/* Footer */}

        <div className="col-span-full flex justify-end border-t border-slate-200 pt-6 dark:border-slate-700">

          <button
            onClick={() => {

              setTheme(selectedTheme);

              updateAppearance({
                theme: selectedTheme,
              });

              addNotification({
                title: "Appearance Updated",
                message:
                  "Theme preferences have been saved successfully.",
                type: "success",
              });

            }}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-violet-700 hover:shadow-lg"
          >

            <Palette size={18} />

            Save Appearance

          </button>

        </div>

      </div>

    </div>

  );

};

export default AppearanceSettings;