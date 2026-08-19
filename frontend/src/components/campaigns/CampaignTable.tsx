import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import type { Campaign } from "@/types/campaign";

interface CampaignTableProps {
  campaigns: Campaign[];

  onView: (campaign: Campaign) => void;

  onEdit: (campaign: Campaign) => void;

  onDelete: (campaign: Campaign) => void;
}

const CampaignTable = ({
  campaigns,
  onView,
  onEdit,
  onDelete,
}: CampaignTableProps) => {
  const getStatusBadge = (
    status: Campaign["status"]
  ) => {
    switch (status) {
      case "Active":
        return (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
            Active
          </span>
        );

      case "Paused":
        return (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
            Paused
          </span>
        );

      case "Completed":
        return (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            Completed
          </span>
        );

      default:
        return null;
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">

        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Campaigns
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage all recruitment campaigns.
        </p>

      </div>

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-slate-50 dark:bg-slate-800">

            <tr>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                Campaign
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                Status
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                Hiring Type
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                Template
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                Steps
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                Delay
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                Open Rate
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                Reply Rate
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                Enrolled
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                Actions
              </th>

            </tr>

          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">

            {campaigns.map((campaign) => (
              <tr
                key={campaign.id}
                className="transition hover:bg-slate-50 dark:hover:bg-slate-800"
              >

                <td className="px-6 py-5">

                  <div>

                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {campaign.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Created {campaign.createdAt}
                    </p>

                  </div>

                </td>

                <td className="px-6 py-5">
                  {getStatusBadge(campaign.status)}
                </td>

                <td className="px-6 py-5 font-medium text-slate-700 dark:text-slate-300">
                  {campaign.hiringType}
                </td>

                <td className="px-6 py-5 text-slate-700 dark:text-slate-300">
                  {campaign.template}
                </td>

                <td className="px-6 py-5 text-center font-semibold">
                  {campaign.steps}
                </td>

                <td className="px-6 py-5 text-center">
                  {campaign.delay} Days
                </td>

                <td className="px-6 py-5 text-center font-semibold text-blue-600">
                  {campaign.openRate}%
                </td>

                <td className="px-6 py-5 text-center font-semibold text-green-600">
                  {campaign.replyRate}%
                </td>

                <td className="px-6 py-5 text-center font-semibold">
                  {campaign.enrolled}
                </td>

                                <td className="px-6 py-5">

                  <div className="flex items-center justify-center gap-2">

                    <button
                      onClick={() => onView(campaign)}
                      className="rounded-lg bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      onClick={() => onEdit(campaign)}
                      className="rounded-lg bg-amber-100 p-2 text-amber-600 transition hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => onDelete(campaign)}
                      className="rounded-lg bg-red-100 p-2 text-red-600 transition hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>

                </td>

              </tr>
            ))}

            {campaigns.length === 0 && (
              <tr>

                <td
                  colSpan={10}
                  className="px-6 py-16 text-center"
                >

                  <div className="flex flex-col items-center">

                    <div className="mb-4 rounded-full bg-slate-100 p-5 dark:bg-slate-800">

                      <Eye
                        size={34}
                        className="text-slate-400"
                      />

                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      No Campaigns Found
                    </h3>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Try changing your search or filters.
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

export default CampaignTable;