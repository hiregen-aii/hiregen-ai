import { useEffect, useState } from "react";
import {
  X,
  Megaphone,
} from "lucide-react";

import {
  campaignTemplates,
} from "@/data/campaigns";

import type {
  Campaign,
  CampaignFormData,
  HiringType,
} from "@/types/campaign";

interface EditCampaignModalProps {
  open: boolean;
  campaign: Campaign | null;
  onClose: () => void;
  onSave: (
    campaign: CampaignFormData
  ) => void;
}

const EditCampaignModal = ({
  open,
  campaign,
  onClose,
  onSave,
}: EditCampaignModalProps) => {
  const [formData, setFormData] =
    useState<CampaignFormData>({
      name: "",
      hiringType: "Intern",
      template: campaignTemplates[0],
      steps: 3,
      delay: 3,
      approvalRequired: true,
    });

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name,
        hiringType: campaign.hiringType,
        template: campaign.template,
        steps: campaign.steps,
        delay: campaign.delay,
        approvalRequired:
          campaign.approvalRequired,
      });
    }
  }, [campaign]);

  if (!open || !campaign) return null;

  const handleChange = (
    key: keyof CampaignFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert("Campaign name is required.");
      return;
    }

    onSave(formData);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/60 p-4 md:items-center">

      <div className="my-8 w-full max-w-4xl rounded-3xl bg-white shadow-2xl dark:bg-[#111827]">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6 dark:border-slate-700">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">

              <Megaphone
                size={28}
                className="text-amber-600"
              />

            </div>

            <div>

              <h2 className="text-2xl font-bold dark:text-white">
                Edit Campaign
              </h2>

              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Update campaign details.
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

        <div className="grid max-h-[65vh] grid-cols-1 gap-6 overflow-y-auto p-8 md:grid-cols-2">

          {/* Campaign Name */}

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Campaign Name
            </label>

            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                handleChange("name", e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-amber-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

          {/* Hiring Type */}

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Hiring Type
            </label>

            <select
              value={formData.hiringType}
              onChange={(e) =>
                handleChange(
                  "hiringType",
                  e.target.value as HiringType
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-amber-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option>Intern</option>
              <option>Full Time</option>
              <option>Contract</option>
              <option>Bulk Hiring</option>
              <option>Campus Drive</option>
            </select>

          </div>

          {/* Base Template */}

          <div className="md:col-span-2">

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Base Template
            </label>

            <select
              value={formData.template}
              onChange={(e) =>
                handleChange(
                  "template",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-amber-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {campaignTemplates.map((template) => (
                <option
                  key={template}
                  value={template}
                >
                  {template}
                </option>
              ))}
            </select>

          </div>

          {/* Steps */}

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Steps
            </label>

            <input
              type="number"
              min={1}
              max={10}
              value={formData.steps}
              onChange={(e) =>
                handleChange(
                  "steps",
                  Number(e.target.value)
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-amber-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

          {/* Delay */}

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Delay Between Steps (Days)
            </label>

            <input
              type="number"
              min={1}
              max={30}
              value={formData.delay}
              onChange={(e) =>
                handleChange(
                  "delay",
                  Number(e.target.value)
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-amber-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

                    {/* Human Review */}

          <div className="md:col-span-2">

            <label className="mb-3 block text-sm font-medium dark:text-white">
              Require Human Review
            </label>

            <button
              type="button"
              onClick={() =>
                handleChange(
                  "approvalRequired",
                  !formData.approvalRequired
                )
              }
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 transition ${
                formData.approvalRequired
                  ? "border-amber-500 bg-amber-50 dark:border-amber-500 dark:bg-amber-900/20"
                  : "border-slate-300 dark:border-slate-700"
              }`}
            >

              <div>

                <p className="font-semibold dark:text-white">
                  Human Approval
                </p>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Review campaign before sending.
                </p>

              </div>

              <div
                className={`h-7 w-14 rounded-full transition ${
                  formData.approvalRequired
                    ? "bg-amber-500"
                    : "bg-slate-300 dark:bg-slate-600"
                }`}
              >

                <div
                  className={`mt-1 h-5 w-5 rounded-full bg-white transition ${
                    formData.approvalRequired
                      ? "ml-8"
                      : "ml-1"
                  }`}
                />

              </div>

            </button>

          </div>

          {/* Preview */}

          <div className="md:col-span-2">

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-700 dark:bg-amber-900/20">

              <h3 className="text-lg font-bold text-amber-700 dark:text-amber-300">
                Campaign Preview
              </h3>

              <div className="mt-4 space-y-2 text-sm">

                <p className="dark:text-white">
                  <span className="font-semibold">
                    Campaign:
                  </span>{" "}
                  {formData.name}
                </p>

                <p className="dark:text-white">
                  <span className="font-semibold">
                    Hiring Type:
                  </span>{" "}
                  {formData.hiringType}
                </p>

                <p className="dark:text-white">
                  <span className="font-semibold">
                    Template:
                  </span>{" "}
                  {formData.template}
                </p>

                <p className="dark:text-white">
                  <span className="font-semibold">
                    Steps:
                  </span>{" "}
                  {formData.steps}
                </p>

                <p className="dark:text-white">
                  <span className="font-semibold">
                    Delay:
                  </span>{" "}
                  {formData.delay} Days
                </p>

                <p className="dark:text-white">
                  <span className="font-semibold">
                    Human Review:
                  </span>{" "}
                  {formData.approvalRequired
                    ? "Required"
                    : "Not Required"}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-8 py-6 dark:border-slate-700 dark:bg-[#111827]">

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-6 py-3 font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white transition hover:bg-amber-600"
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>
  );
};

export default EditCampaignModal;