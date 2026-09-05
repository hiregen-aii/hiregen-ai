import { useEffect, useState } from "react";
import { X, Building2 } from "lucide-react";

import type { Company } from "@/types/company";

interface EditCompanyModalProps {
  open: boolean;
  company: Company | null;
  onClose: () => void;
  onSave: (company: Company) => void;
}

const EditCompanyModal = ({
  open,
  company,
  onClose,
  onSave,
}: EditCompanyModalProps) => {
  const [formData, setFormData] = useState<Company | null>(null);

  useEffect(() => {
    if (company) {
      setFormData(company);
    }
  }, [company]);

  if (!open || !formData) return null;

  const handleChange = (
    key: keyof Company,
    value: string | number
  ) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">

      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-[#111827]">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6 dark:border-slate-700">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30">

              <Building2
                size={28}
                className="text-violet-600"
              />

            </div>

            <div>

              <h2 className="text-2xl font-bold dark:text-white">
                Edit Company Profile
              </h2>

              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Update company information.
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

        <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2">

          {/* Company Name */}

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Company Name
            </label>

            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                handleChange("name", e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

          {/* Industry */}

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Industry
            </label>

            <input
              type="text"
              value={formData.industry}
              onChange={(e) =>
                handleChange("industry", e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

          {/* Email */}

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Email
            </label>

            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                handleChange("email", e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

          {/* Phone */}

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Phone
            </label>

            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                handleChange("phone", e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

          {/* Website */}

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Website
            </label>

            <input
              type="text"
              value={formData.website}
              onChange={(e) =>
                handleChange("website", e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

          {/* CEO */}

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              CEO / Founder
            </label>

            <input
              type="text"
              value={formData.ceo}
              onChange={(e) =>
                handleChange("ceo", e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

                    {/* Employees */}

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Employees
            </label>

            <input
              type="number"
              value={formData.employees}
              onChange={(e) =>
                handleChange("employees", Number(e.target.value))
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

          {/* Established */}

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Established
            </label>

            <input
              type="number"
              value={formData.established}
              onChange={(e) =>
                handleChange("established", Number(e.target.value))
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

          {/* Location */}

          <div className="md:col-span-2">

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Location
            </label>

            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                handleChange("location", e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

          {/* Status */}

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Status
            </label>

            <select
              value={formData.status}
              onChange={(e) =>
                handleChange(
                  "status",
                  e.target.value as "Active" | "Inactive"
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

          </div>

          {/* Hiring Progress */}

          <div>

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Hiring Progress (%)
            </label>

            <input
              type="number"
              min={0}
              max={100}
              value={formData.hiringProgress}
              onChange={(e) =>
                handleChange(
                  "hiringProgress",
                  Number(e.target.value)
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

          {/* Description */}

          <div className="md:col-span-2">

            <label className="mb-2 block text-sm font-medium dark:text-white">
              Company Description
            </label>

            <textarea
              rows={5}
              value={formData.description}
              onChange={(e) =>
                handleChange("description", e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-4 border-t border-slate-200 px-8 py-6 dark:border-slate-700">

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-6 py-3 font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700"
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>
  );
};

export default EditCompanyModal;