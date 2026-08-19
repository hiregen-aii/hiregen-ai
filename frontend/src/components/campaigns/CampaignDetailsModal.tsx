import {
  X,
  Megaphone,
  Calendar,
  Layers,
  Clock3,
  Users,
  Mail,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";

import type { Campaign } from "@/types/campaign";

interface CampaignDetailsModalProps {
  open: boolean;
  campaign: Campaign | null;
  onClose: () => void;
}

const CampaignDetailsModal = ({
  open,
  campaign,
  onClose,
}: CampaignDetailsModalProps) => {
  if (!open || !campaign) return null;

  const statusColor =
    campaign.status === "Active"
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      : campaign.status === "Paused"
      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/60 p-4 md:items-center">

      <div className="my-8 w-full max-w-5xl rounded-3xl bg-white shadow-2xl dark:bg-[#111827]">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6 dark:border-slate-700">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">

              <Megaphone
                size={28}
                className="text-blue-600"
              />

            </div>

            <div>

              <h2 className="text-2xl font-bold dark:text-white">
                Campaign Details
              </h2>

              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Complete campaign overview.
              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={22} />
          </button>

        </div>

        {/* Body */}

        <div className="max-h-[65vh] overflow-y-auto p-8">

          {/* Campaign Overview */}

          <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <h2 className="text-3xl font-bold">
                  {campaign.name}
                </h2>

                <p className="mt-2 text-blue-100">
                  {campaign.template}
                </p>

              </div>

              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${statusColor}`}
              >
                {campaign.status}
              </span>

            </div>

          </div>

          {/* Information */}

          <div className="mt-8 grid gap-5 md:grid-cols-2">

            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-700">

              <Layers className="text-violet-600" />

              <div>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Hiring Type
                </p>

                <p className="font-semibold dark:text-white">
                  {campaign.hiringType}
                </p>

              </div>

            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-700">

              <Calendar className="text-blue-600" />

              <div>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Created
                </p>

                <p className="font-semibold dark:text-white">
                  {campaign.createdAt}
                </p>

              </div>

            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-700">

              <Clock3 className="text-orange-600" />

              <div>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Delay Between Steps
                </p>

                <p className="font-semibold dark:text-white">
                  {campaign.delay} Days
                </p>

              </div>

            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-700">

              <CheckCircle2 className="text-green-600" />

              <div>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Human Review
                </p>

                <p className="font-semibold dark:text-white">
                  {campaign.approvalRequired
                    ? "Required"
                    : "Not Required"}
                </p>

              </div>

            </div>

          </div>

                    {/* Performance */}

          <div className="mt-8 grid gap-5 md:grid-cols-4">

            <div className="rounded-2xl border border-slate-200 p-5 text-center dark:border-slate-700">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Mail
                  size={22}
                  className="text-blue-600"
                />
              </div>

              <h3 className="mt-3 text-3xl font-bold text-blue-600">
                {campaign.openRate}%
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Open Rate
              </p>

            </div>

            <div className="rounded-2xl border border-slate-200 p-5 text-center dark:border-slate-700">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <MessageSquare
                  size={22}
                  className="text-green-600"
                />
              </div>

              <h3 className="mt-3 text-3xl font-bold text-green-600">
                {campaign.replyRate}%
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Reply Rate
              </p>

            </div>

            <div className="rounded-2xl border border-slate-200 p-5 text-center dark:border-slate-700">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
                <Users
                  size={22}
                  className="text-violet-600"
                />
              </div>

              <h3 className="mt-3 text-3xl font-bold text-violet-600">
                {campaign.enrolled}
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Leads Enrolled
              </p>

            </div>

            <div className="rounded-2xl border border-slate-200 p-5 text-center dark:border-slate-700">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                <Layers
                  size={22}
                  className="text-orange-600"
                />
              </div>

              <h3 className="mt-3 text-3xl font-bold text-orange-600">
                {campaign.steps}
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Steps
              </p>

            </div>

          </div>

          {/* Summary */}

          <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">

            <h3 className="text-lg font-bold text-blue-700 dark:text-blue-300">
              Campaign Summary
            </h3>

            <div className="mt-4 space-y-2 text-sm">

              <p className="dark:text-white">
                <span className="font-semibold">
                  Campaign Name:
                </span>{" "}
                {campaign.name}
              </p>

              <p className="dark:text-white">
                <span className="font-semibold">
                  Template:
                </span>{" "}
                {campaign.template}
              </p>

              <p className="dark:text-white">
                <span className="font-semibold">
                  Hiring Type:
                </span>{" "}
                {campaign.hiringType}
              </p>

              <p className="dark:text-white">
                <span className="font-semibold">
                  Status:
                </span>{" "}
                {campaign.status}
              </p>

              <p className="dark:text-white">
                <span className="font-semibold">
                  Human Review:
                </span>{" "}
                {campaign.approvalRequired
                  ? "Required"
                  : "Not Required"}
              </p>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="sticky bottom-0 flex justify-end border-t border-slate-200 bg-white px-8 py-6 dark:border-slate-700 dark:bg-[#111827]">

          <button
            onClick={onClose}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
};

export default CampaignDetailsModal;