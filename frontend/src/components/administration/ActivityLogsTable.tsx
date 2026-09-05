import {
  Download,
  Search,
  Activity,
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import type {
  ActivityLog,
} from "@/types/administration";

interface ActivityLogsTableProps {
  logs: ActivityLog[];

  searchTerm: string;

  onSearchChange: (
    value: string
  ) => void;
}

const ActivityLogsTable = ({
  logs,
  searchTerm,
  onSearchChange,
}: ActivityLogsTableProps) => {

  const filteredLogs =
    logs.filter((log) => {

      const keyword =
        searchTerm.toLowerCase();

      return (

        log.admin
          .toLowerCase()
          .includes(keyword) ||

        log.activity
          .toLowerCase()
          .includes(keyword) ||

        log.module
          .toLowerCase()
          .includes(keyword) ||

        log.status
          .toLowerCase()
          .includes(keyword)

      );

    });

  const exportPDF = () => {

    const doc =
      new jsPDF();

    doc.setFontSize(18);

    doc.text(
      "HireGen AI - Activity Logs",
      14,
      18
    );

    autoTable(doc, {

      startY: 28,

      head: [[
        "Date",
        "Admin",
        "Activity",
        "Module",
        "Status",
      ]],

      body: filteredLogs.map(
        (log) => [

          log.date,

          log.admin,

          log.activity,

          log.module,

          log.status,

        ]
      ),

      theme: "grid",

      headStyles: {
        fillColor: [124, 58, 237],
      },

    });

    doc.save(
      "ActivityLogs.pdf"
    );

  };

  const getStatusClass = (
    status: ActivityLog["status"]
  ) => {

    switch (status) {

      case "Success":
      case "Completed":
      case "Approved":
      case "Passed":

        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";

      case "Running":

        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";

      case "Saved":

        return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300";

      case "Removed":

        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";

      default:

        return "bg-slate-100 text-slate-700";
    }

  };

  return (

    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#111827]">

              {/* Header */}

      <div className="flex flex-col gap-4 border-b border-slate-200 p-6 dark:border-slate-700 lg:flex-row lg:items-center lg:justify-between">

        <div className="relative w-full lg:max-w-md">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) =>
              onSearchChange(e.target.value)
            }
            placeholder="Search activity logs..."
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-violet-900/30"
          />

        </div>

        <button
          onClick={exportPDF}
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-medium text-white transition-all duration-300 hover:bg-violet-700 hover:shadow-lg"
        >

          <Download size={18} />

          Export PDF

        </button>

      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">

            <tr>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                Date
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                Admin
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                Activity
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                Module
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

                      {filteredLogs.map((log) => (

            <tr
              key={log.id}
              className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
            >

              {/* Date */}

              <td className="px-6 py-5 text-sm text-slate-700 dark:text-slate-300">
                {log.date}
              </td>

              {/* Admin */}

              <td className="px-6 py-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">

                    {log.admin.charAt(0)}

                  </div>

                  <span className="font-medium text-slate-900 dark:text-white">
                    {log.admin}
                  </span>

                </div>

              </td>

              {/* Activity */}

              <td className="px-6 py-5">

                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {log.activity}
                </span>

              </td>

              {/* Module */}

              <td className="px-6 py-5">

                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">

                  {log.module}

                </span>

              </td>

              {/* Status */}

              <td className="px-6 py-5">

                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusClass(
                    log.status
                  )}`}
                >
                  {log.status}
                </span>

              </td>

            </tr>

          ))}

                    {filteredLogs.length === 0 && (

            <tr>

              <td
                colSpan={5}
                className="px-6 py-16 text-center"
              >

                <div className="flex flex-col items-center">

                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">

                    <Activity
                      size={32}
                      className="text-slate-400"
                    />

                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    No Activity Logs Found
                  </h3>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Try changing your search or check back later.
                  </p>

                </div>

              </td>

            </tr>

          )}

          </tbody>

        </table>

      </div>

    </div>

  );
};

export default ActivityLogsTable;