import { useState } from "react";
import {
  Download,
  ChevronDown,
} from "lucide-react";

import {
  hiringTypeOptions,
  leadStageOptions,
  ownerOptions,
  sourceOptions,
  campaignOptions,
} from "@/data/analytics";

import type {
  AnalyticsFilters as AnalyticsFiltersType,
  HiringType,
  LeadStage,
} from "@/types/analytics";

interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersType;

  onHiringTypeChange: (
    value: HiringType
  ) => void;

  onLeadStageChange: (
    value: LeadStage
  ) => void;

  onOwnerChange: (
    value: string
  ) => void;

  onSourceChange: (
    value: string
  ) => void;

  onCampaignChange: (
    value: string
  ) => void;

  onExport: (
    type: "CSV" | "Excel" | "PDF"
  ) => void;
}

const AnalyticsFilters = ({
  filters,
  onHiringTypeChange,
  onLeadStageChange,
  onOwnerChange,
  onSourceChange,
  onCampaignChange,
  onExport,
}: AnalyticsFiltersProps) => {
  const [showExportMenu, setShowExportMenu] =
    useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

        {/* Filters */}

        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

          {/* Hiring Type */}

          <select
            value={filters.hiringType}
            onChange={(e) =>
              onHiringTypeChange(
                e.target.value as HiringType
              )
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {hiringTypeOptions.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>

          {/* Lead Stage */}

          <select
            value={filters.leadStage}
            onChange={(e) =>
              onLeadStageChange(
                e.target.value as LeadStage
              )
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {leadStageOptions.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>

          {/* Owner */}

          <select
            value={filters.owner}
            onChange={(e) =>
              onOwnerChange(e.target.value)
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {ownerOptions.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>

          {/* Source */}

          <select
            value={filters.source}
            onChange={(e) =>
              onSourceChange(e.target.value)
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {sourceOptions.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>

          {/* Campaign */}

          <select
            value={filters.campaign}
            onChange={(e) =>
              onCampaignChange(e.target.value)
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {campaignOptions.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>

        </div>

                {/* Export */}

        <div className="relative flex justify-end">

          <button
            onClick={() =>
              setShowExportMenu((prev) => !prev)
            }
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700"
          >
            <Download size={18} />
            Export Data
            <ChevronDown size={16} />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-14 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-[#111827]">

              <button
                onClick={() => {
                  onExport("CSV");
                  setShowExportMenu(false);
                }}
                className="block w-full px-5 py-3 text-left transition hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
              >
                Export CSV
              </button>

              <button
                onClick={() => {
                  onExport("Excel");
                  setShowExportMenu(false);
                }}
                className="block w-full px-5 py-3 text-left transition hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
              >
                Export Excel
              </button>

              <button
                onClick={() => {
                  onExport("PDF");
                  setShowExportMenu(false);
                }}
                className="block w-full px-5 py-3 text-left transition hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
              >
                Export PDF
              </button>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default AnalyticsFilters;