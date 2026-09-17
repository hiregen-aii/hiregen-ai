import { Search, Filter, Plus, MapPin, X } from "lucide-react";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

interface CandidateSearchBarProps {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  locationFilter: string;
  setLocationFilter: Dispatch<SetStateAction<string>>;
  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;
  availabilityFilter: string;
  setAvailabilityFilter: Dispatch<SetStateAction<string>>;
  experienceFilter: string;
  setExperienceFilter: Dispatch<SetStateAction<string>>;
  scoreFilter: string;
  setScoreFilter: Dispatch<SetStateAction<string>>;
  onAddCandidate: () => void;
}

const INDIAN_CITIES = [
  "All Locations",
  "Bangalore",
  "Hyderabad",
  "Pune",
  "Delhi NCR",
  "Gurgaon",
  "Noida",
  "Mumbai",
  "Chennai",
];

const STATUSES = [
  "All Statuses",
  "AVAILABLE",
  "SCREENING",
  "SHORTLISTED",
  "INTERVIEWING",
  "OFFERED",
  "HIRED",
];

const AVAILABILITY_OPTIONS = [
  "All",
  "Immediate",
  "15 Days",
  "30 Days",
];

const CandidateSearchBar = ({
  search,
  setSearch,
  locationFilter,
  setLocationFilter,
  statusFilter,
  setStatusFilter,
  availabilityFilter,
  setAvailabilityFilter,
  experienceFilter,
  setExperienceFilter,
  scoreFilter,
  setScoreFilter,
  onAddCandidate,
}: CandidateSearchBarProps) => {
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeFilterCount = [
    locationFilter !== "All Locations",
    statusFilter !== "All Statuses",
    availabilityFilter !== "All",
    experienceFilter !== "All",
    scoreFilter !== "All",
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setLocationFilter("All Locations");
    setStatusFilter("All Statuses");
    setAvailabilityFilter("All");
    setExperienceFilter("All");
    setScoreFilter("All");
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 max-w-xl">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Indian talent by candidate name, role, skills, or company..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm shadow-sm transition placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-[#111827] dark:text-white"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter Popover Button */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setShowFilter((prev) => !prev)}
            className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm transition ${
              activeFilterCount > 0
                ? "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <Filter size={16} className="text-violet-600" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Filter Dropdown Menu */}
          {showFilter && (
            <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-[#111827]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Filter Candidates</span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-violet-600 hover:underline dark:text-violet-400"
                  >
                    Reset All
                  </button>
                )}
              </div>

              <div className="mt-4 space-y-4 text-xs">
                {/* City / Location (India) */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <MapPin size={13} className="text-emerald-600" />
                    <span>Location (India Hub)</span>
                  </label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {INDIAN_CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Candidate Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>{st.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>

                {/* Notice Period / Availability */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Availability / Notice Period
                  </label>
                  <select
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Experience */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Experience Level
                  </label>
                  <select
                    value={experienceFilter}
                    onChange={(e) => setExperienceFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="All">Any Experience</option>
                    <option value="intern">Interns & Students (0-1 Yr)</option>
                    <option value="fresher">Freshers / Entry Level (1-2 Yrs)</option>
                    <option value="2">2+ Years</option>
                    <option value="4">4+ Years</option>
                    <option value="6">6+ Years</option>
                    <option value="8">8+ Years</option>
                  </select>
                </div>

                {/* Fit Score */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Minimum Fit Score
                  </label>
                  <select
                    value={scoreFilter}
                    onChange={(e) => setScoreFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="All">All Scores</option>
                    <option value="80+">80% & Above</option>
                    <option value="85+">85% & Above</option>
                    <option value="90+">90% & Above (Elite)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Candidate Button */}
        <button
          onClick={onAddCandidate}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition hover:from-violet-700 hover:to-indigo-700 hover:shadow-lg"
        >
          <Plus size={16} />
          <span>Add Candidate</span>
        </button>
      </div>
    </div>
  );
};

export default CandidateSearchBar;
