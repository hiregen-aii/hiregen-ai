import {
  Search,
  Filter,
  Plus,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  Dispatch,
  SetStateAction,
} from "react";

interface LeadSearchBarProps {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;

  source: string;
  setSource: Dispatch<SetStateAction<string>>;

  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;

  typeFilter: string;
  setTypeFilter: Dispatch<SetStateAction<string>>;

  scoreFilter: string;
  setScoreFilter: Dispatch<SetStateAction<string>>;

  onAddLead: () => void;
}

const LeadSearchBar = ({
  search,
  setSearch,

  source,
  setSource,

  statusFilter,
  setStatusFilter,

  typeFilter,
  setTypeFilter,

  scoreFilter,
  setScoreFilter,

  onAddLead,
}: LeadSearchBarProps) => {
  const [showFilter, setShowFilter] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setShowFilter(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () =>
      document.removeEventListener(
        "mousedown",
        handler
      );
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        {/* Search */}

        <div className="relative w-full lg:max-w-xl">

          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, HR or email..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />

        </div>

        {/* Right */}

        <div className="flex flex-wrap items-center gap-3">

          {/* Source */}

          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option>All Sources</option>
            <option>LinkedIn</option>
            <option>Naukri</option>
            <option>Indeed</option>
            <option>Referral</option>
          </select>

          {/* Filter */}

          <div
            className="relative"
            ref={filterRef}
          >

            <button
              onClick={() =>
                setShowFilter(!showFilter)
              }
              className="rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <Filter className="h-5 w-5 dark:text-white" />
            </button>

            {showFilter && (
              <div className="absolute right-0 z-50 mt-3 w-72 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-[#111827]">

                <h3 className="mb-5 text-lg font-semibold dark:text-white">
                  Filter Leads
                </h3>

                <div className="space-y-4">

                  <div>

                    <label className="mb-2 block text-sm font-medium dark:text-white">
                      Status
                    </label>

                    <select
                      value={statusFilter}
                      onChange={(e)=>setStatusFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <option>All</option>
                      <option>Contacted</option>
                      <option>Replied</option>
                      <option>Meeting</option>
                      <option>Proposal Sent</option>
                      <option>Client Won</option>
                    </select>

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-medium dark:text-white">
                      Job Type
                    </label>

                    <select
                      value={typeFilter}
                      onChange={(e)=>setTypeFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <option>All</option>
                      <option>Internship</option>
                      <option>Full Time</option>
                      <option>Contract</option>
                    </select>

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-medium dark:text-white">
                      Lead Score
                    </label>

                    <select
                      value={scoreFilter}
                      onChange={(e)=>setScoreFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <option>All</option>
                      <option>70+</option>
                      <option>80+</option>
                      <option>90+</option>
                    </select>

                  </div>

                  <div className="flex gap-3 pt-2">

                    <button
                      onClick={()=>{
                        setStatusFilter("All");
                        setTypeFilter("All");
                        setScoreFilter("All");
                      }}
                      className="flex-1 rounded-xl border border-slate-300 py-2 dark:border-slate-700"
                    >
                      Clear
                    </button>

                    <button
                      onClick={()=>setShowFilter(false)}
                      className="flex-1 rounded-xl bg-violet-600 py-2 font-semibold text-white"
                    >
                      Apply
                    </button>

                  </div>

                </div>

              </div>
            )}

          </div>

          {/* Add Lead */}

          <button
            onClick={onAddLead}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 font-semibold text-white shadow-md transition hover:scale-[1.02]"
          >
            <Plus className="h-5 w-5" />

            Add Lead

          </button>

        </div>

      </div>

    </div>
  );
};

export default LeadSearchBar;