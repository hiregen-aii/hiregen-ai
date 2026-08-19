import { Search } from "lucide-react";

interface ApprovalSearchBarProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;

  status: string;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
}

const ApprovalSearchBar = ({
  search,
  setSearch,
  status,
  setStatus,
}: ApprovalSearchBarProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        {/* Search */}

        <div className="relative w-full lg:max-w-md">

          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Search company or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />

        </div>

        {/* Filter */}

        <div className="w-full lg:w-52">

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option>All</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Scheduled</option>
          </select>

        </div>

      </div>

    </div>
  );
};

export default ApprovalSearchBar;