import { useState } from "react";

import {
  Bot,
  Brain,
  FileSearch,
  Mail,
} from "lucide-react";

import { useSettings } from "@/context/SettingsContext";
import { useNotifications } from "@/context/NotificationContext";

import type { AIModel } from "@/types/settings";

interface AIOption {
  key:
    | "resumeScreening"
    | "candidateRanking"
    | "emailSuggestions";
  title: string;
  description: string;
  icon: typeof FileSearch;
}

const aiOptions: AIOption[] = [
  {
    key: "resumeScreening",
    title: "AI Resume Screening",
    description:
      "Automatically screen resumes using AI.",
    icon: FileSearch,
  },
  {
    key: "candidateRanking",
    title: "Candidate Ranking",
    description:
      "Rank candidates based on job relevance.",
    icon: Brain,
  },
  {
    key: "emailSuggestions",
    title: "Email Suggestions",
    description:
      "Generate AI-powered email drafts.",
    icon: Mail,
  },
];

const AISettings = () => {

  const {
    settings,
    updateAI,
  } = useSettings();

  const {
    addNotification,
  } = useNotifications();

  const [aiSettings, setAISettings] =
    useState(settings.ai);

  const toggleSetting = (
    key: AIOption["key"]
  ) => {

    setAISettings((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));

  };

  return (

    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <div className="border-b border-slate-200 p-6 dark:border-slate-700">

        <div className="flex items-center gap-4">

          <div className="rounded-xl bg-violet-100 p-3 dark:bg-violet-900/30">

            <Bot
              size={22}
              className="text-violet-600 dark:text-violet-400"
            />

          </div>

          <div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">

              AI Preferences

            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

              Configure AI-powered recruitment features.

            </p>

          </div>

        </div>

      </div>

      {/* Content */}

      <div className="space-y-6 p-6">

        {aiOptions.map((option) => {

          const Icon = option.icon;

          return (

            <div
              key={option.key}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700"
            >

              <div className="flex items-center gap-4">

                <div className="rounded-lg bg-violet-100 p-3 dark:bg-violet-900/30">

                  <Icon
                    size={20}
                    className="text-violet-600 dark:text-violet-400"
                  />

                </div>

                <div>

                  <h3 className="font-semibold text-slate-900 dark:text-white">

                    {option.title}

                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400">

                    {option.description}

                  </p>

                </div>

              </div>

              <button
                onClick={() =>
                  toggleSetting(option.key)
                }
                className={`relative h-7 w-14 rounded-full transition-all duration-300 ${
                  aiSettings[option.key]
                    ? "bg-violet-600"
                    : "bg-slate-300 dark:bg-slate-600"
                }`}
              >

                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${
                    aiSettings[option.key]
                      ? "left-8"
                      : "left-1"
                  }`}
                />

              </button>

            </div>

          );

        })}

        {/* Match Score */}

        <div>

          <div className="mb-3 flex items-center justify-between">

            <h3 className="font-semibold text-slate-900 dark:text-white">

              Match Score Threshold

            </h3>

            <span className="rounded-lg bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">

              {aiSettings.matchScore}%

            </span>

          </div>

          <input
            type="range"
            min={50}
            max={100}
            value={aiSettings.matchScore}
            onChange={(e) =>
              setAISettings((previous) => ({
                ...previous,
                matchScore: Number(
                  e.target.value
                ),
              }))
            }
            className="w-full accent-violet-600"
          />

        </div>

        {/* Preferred AI Model */}

        <div>

          <label className="mb-2 block font-semibold text-slate-900 dark:text-white">

            Preferred AI Model

          </label>

          <select
            value={aiSettings.preferredModel}
            onChange={(e) =>
              setAISettings((previous) => ({
                ...previous,
                preferredModel:
                  e.target.value as AIModel,
              }))
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all focus:border-violet-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          >

            <option value="GPT-4">
              GPT-4
            </option>

            <option value="Claude">
              Claude
            </option>

            <option value="Gemini">
              Gemini
            </option>

          </select>

        </div>

                {/* Footer */}

        <div className="flex justify-end border-t border-slate-200 pt-6 dark:border-slate-700">

          <button
            onClick={() => {

              updateAI(aiSettings);

              addNotification({
                title: "AI Settings Saved",
                message:
                  "Your AI preferences have been updated successfully.",
                type: "success",
              });

            }}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-violet-700 hover:shadow-lg"
          >

            <Bot size={18} />

            Save AI Settings

          </button>

        </div>

      </div>

    </div>

  );

};

export default AISettings;