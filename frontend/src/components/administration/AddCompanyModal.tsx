import { useEffect, useState } from "react";
import {
  Building2,
  Save,
  X,
} from "lucide-react";

import type {
  AddCompanyForm,
  Company,
} from "@/types/administration";

interface AddCompanyModalProps {
  open: boolean;
  mode: "add" | "edit";
  company?: Company | null;

  onClose: () => void;

  onSave: (
    data: AddCompanyForm
  ) => void;
}

const AddCompanyModal = ({
  open,
  mode,
  company,
  onClose,
  onSave,
}: AddCompanyModalProps) => {

  const emptyForm: AddCompanyForm = {
    name: "",
    email: "",
    industry: "",
    website: "",
    phone: "",
    location: "",
    verification: "Verified",
    status: "Active",
  };

  const [form, setForm] =
    useState<AddCompanyForm>(
      emptyForm
    );

  useEffect(() => {

    if (mode === "edit" && company) {

      setForm({
        name: company.name,
        email: company.email,
        industry: company.industry,
        website: company.website,
        phone: company.phone,
        location: company.location,
        verification: company.verification,
        status: company.status,
      });

    } else {

      setForm(emptyForm);

    }

  }, [mode, company]);

  if (!open) return null;

  const handleChange = (
    field: keyof AddCompanyForm,
    value: string
  ) => {

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

  };

  const handleSave = () => {

    onSave(form);

    onClose();

  };

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl dark:bg-[#111827]">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">

          <div className="flex items-center gap-3">

            <div className="rounded-full bg-violet-100 p-3 dark:bg-violet-900/30">

              <Building2
                size={22}
                className="text-violet-600"
              />

            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">

                {mode === "add"
                  ? "Add Company"
                  : "Edit Company"}

              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enter company information below.
              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >

            <X size={20} />

          </button>

        </div>

        {/* Form */}

        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

                      {/* Company Name */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Company Name
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                handleChange("name", e.target.value)
              }
              placeholder="Enter company name"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-violet-900/30"
            />

          </div>

          {/* Email */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Company Email
            </label>

            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                handleChange("email", e.target.value)
              }
              placeholder="Enter company email"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-violet-900/30"
            />

          </div>

          {/* Industry */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Industry
            </label>

            <input
              type="text"
              value={form.industry}
              onChange={(e) =>
                handleChange(
                  "industry",
                  e.target.value
                )
              }
              placeholder="Enter industry"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-violet-900/30"
            />

          </div>

          {/* Website */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Website
            </label>

            <input
              type="url"
              value={form.website}
              onChange={(e) =>
                handleChange(
                  "website",
                  e.target.value
                )
              }
              placeholder="https://company.com"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-violet-900/30"
            />

          </div>

                    {/* Phone */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Phone Number
            </label>

            <input
              type="text"
              value={form.phone}
              onChange={(e) =>
                handleChange(
                  "phone",
                  e.target.value
                )
              }
              placeholder="Enter company phone"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-violet-900/30"
            />

          </div>

          {/* Location */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Location
            </label>

            <input
              type="text"
              value={form.location}
              onChange={(e) =>
                handleChange(
                  "location",
                  e.target.value
                )
              }
              placeholder="Enter company location"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-violet-900/30"
            />

          </div>

          {/* Verification */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Verification
            </label>

            <select
              value={form.verification}
              onChange={(e) =>
                handleChange(
                  "verification",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-violet-900/30"
            >

              <option value="Verified">
                Verified
              </option>

              <option value="Pending">
                Pending
              </option>

            </select>

          </div>

          {/* Status */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Status
            </label>

            <select
              value={form.status}
              onChange={(e) =>
                handleChange(
                  "status",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-violet-900/30"
            >

              <option value="Active">
                Active
              </option>

              <option value="Waiting">
                Waiting
              </option>

            </select>

          </div>

                  </div>

        {/* Footer */}

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-6 dark:border-slate-700">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition-all duration-300 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:bg-violet-700 hover:shadow-lg"
          >

            <Save size={18} />

            {mode === "add"
              ? "Save Company"
              : "Update Company"}

          </button>

        </div>

      </div>

    </div>

  );
};

export default AddCompanyModal;