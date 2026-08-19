import { Search, Plus } from "lucide-react";

import type {
  CampaignFilter,
  CampaignStatus,
  HiringType,
} from "@/types/campaign";

import {
  campaignStatuses,
  hiringTypes,
} from "@/data/campaigns";

interface CampaignFiltersProps {
  filters: CampaignFilter;

  onSearch: (value: string) => void;

  onStatusChange: (
    status: "All" | CampaignStatus
  ) => void;

  onHiringTypeChange: (
    type: "All" | HiringType
  ) => void;

  onNewCampaign: () => void;
}

const CampaignFilters = ({
  filters,
  onSearch,
  onStatusChange,
  onHiringTypeChange,
  onNewCampaign,
}: CampaignFiltersProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        {/* Left */}

        <div className="flex flex-1 flex-col gap-4 md:flex-row">

          {/* Search */}

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={filters.search}
              placeholder="Search campaigns..."
              onChange={(e) =>
                onSearch(e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

          {/* Status */}

          <select
            value={filters.status}
            onChange={(e) =>
              onStatusChange(
                e.target.value as
                  | "All"
                  | CampaignStatus
              )
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {campaignStatuses.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>

          {/* Hiring Type */}

          <select
            value={filters.hiringType}
            onChange={(e) =>
              onHiringTypeChange(
                e.target.value as
                  | "All"
                  | HiringType
              )
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {hiringTypes.map((type) => (
              <option
                key={type}
                value={type}
              >
                {type}
              </option>
            ))}
          </select>

        </div>

        {/* Right */}

        <button
          onClick={onNewCampaign}
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700"
        >
          <Plus size={18} />
          New Campaign
        </button>

      </div>

    </div>
  );
};

export default CampaignFilters;