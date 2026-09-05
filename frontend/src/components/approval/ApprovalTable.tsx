import { Eye, Building2 } from "lucide-react";
import type { ApprovalDraft } from "@/data/approval";

interface ApprovalTableProps {
  drafts: ApprovalDraft[];
  onReview: (draft: ApprovalDraft) => void;
}

const statusColor = (status: ApprovalDraft["status"]) => {
  switch (status) {
    case "Approved":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

    case "Rejected":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

    case "Scheduled":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";

    default:
      return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400";
  }
};

const ApprovalTable = ({
  drafts,
  onReview,
}: ApprovalTableProps) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">

        <h2 className="text-xl font-semibold dark:text-white">
          Approval Queue
        </h2>

        <span className="rounded-full bg-violet-100 px-4 py-1 text-sm font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
          {drafts.length} Records
        </span>

      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-slate-50 dark:bg-slate-900">

            <tr className="text-left">

              <th className="px-6 py-4 text-sm font-semibold dark:text-white">
                Company
              </th>

              <th className="px-6 py-4 text-sm font-semibold dark:text-white">
                Contact
              </th>

              <th className="px-6 py-4 text-sm font-semibold dark:text-white">
                Job Title
              </th>

              <th className="px-6 py-4 text-sm font-semibold dark:text-white">
                AI Score
              </th>

              <th className="px-6 py-4 text-sm font-semibold dark:text-white">
                Status
              </th>

              <th className="px-6 py-4 text-sm font-semibold dark:text-white">
                Date
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold dark:text-white">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {drafts.length === 0 && (

              <tr>

                <td
                  colSpan={7}
                  className="py-16 text-center text-slate-500 dark:text-slate-400"
                >
                  No drafts found.
                </td>

              </tr>

            )}

            {drafts.map((draft) => (

              <tr
                key={draft.id}
                className="cursor-pointer border-t border-slate-100 transition hover:bg-violet-50 dark:border-slate-700 dark:hover:bg-violet-900/20"
              >

                {/* Company */}

                <td className="px-6 py-5">

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30">

                      <Building2 className="h-6 w-6 text-violet-600" />

                    </div>

                    <div>

                      <h3 className="font-semibold dark:text-white">
                        {draft.company}
                      </h3>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {draft.industry}
                      </p>

                    </div>

                  </div>

                </td>

                {/* Contact */}

                <td className="px-6 py-5">

                  <div>

                    <h3 className="font-medium dark:text-white">
                      {draft.contact}
                    </h3>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {draft.email}
                    </p>

                  </div>

                </td>

                {/* Job */}

                <td className="px-6 py-5 dark:text-white">
                  {draft.jobTitle}
                </td>

                {/* Score */}

                <td className="px-6 py-5">

                  <span className="text-lg font-bold text-green-600">
                    {draft.aiScore}%
                  </span>

                </td>

                {/* Status */}

                <td className="px-6 py-5">

                  <span
                    className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-sm font-semibold ${statusColor(
                      draft.status
                    )}`}
                  >
                    {draft.status}
                  </span>

                </td>

                {/* Date */}

                <td className="px-6 py-5 dark:text-white">
                  {draft.generatedOn}
                </td>

                {/* Action */}

                <td className="px-6 py-5 text-center">

                  <button
                    onClick={() => onReview(draft)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium transition hover:border-violet-500 hover:bg-violet-50 dark:border-slate-600 dark:hover:bg-violet-900/20"
                  >
                    <Eye className="h-4 w-4" />
                    Review
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default ApprovalTable;