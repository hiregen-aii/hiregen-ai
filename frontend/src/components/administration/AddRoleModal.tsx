import { useEffect, useState } from "react";
import { Save, ShieldCheck, X } from "lucide-react";

import type {
  AddRoleForm,
  Role,
} from "@/types/administration";

interface AddRoleModalProps {
  open: boolean;
  mode: "add" | "edit";
  role?: Role | null;

  onClose: () => void;

  onSave: (
    data: AddRoleForm
  ) => void;
}

const AddRoleModal = ({
  open,
  mode,
  role,
  onClose,
  onSave,
}: AddRoleModalProps) => {

  const emptyForm: AddRoleForm = {
    name: "",
    permissions: "",
    status: "Active",
  };

  const [form, setForm] =
    useState<AddRoleForm>(
      emptyForm
    );

  useEffect(() => {

    if (mode === "edit" && role) {

      setForm({
        name: role.name,
        permissions: role.permissions,
        status: role.status,
      });

    } else {

      setForm(emptyForm);

    }

  }, [mode, role]);

  if (!open) return null;

  const handleChange = (
    field: keyof AddRoleForm,
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

      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl dark:bg-[#111827]">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">

          <div className="flex items-center gap-3">

            <div className="rounded-full bg-violet-100 p-3 dark:bg-violet-900/30">

              <ShieldCheck
                size={22}
                className="text-violet-600"
              />

            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">

                {mode === "add"
                  ? "Add Role"
                  : "Edit Role"}

              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Configure role details and permissions.
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

        <div className="space-y-5 p-6">

                      {/* Role Name */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Role Name
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                handleChange("name", e.target.value)
              }
              placeholder="Enter role name"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-violet-900/30"
            />

          </div>

          {/* Permissions */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Permissions
            </label>

            <textarea
              rows={4}
              value={form.permissions}
              onChange={(e) =>
                handleChange(
                  "permissions",
                  e.target.value
                )
              }
              placeholder="Example: User Management, Company Management, Analytics"
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-violet-900/30"
            />

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

              <option value="Limited">
                Limited
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
              ? "Save Role"
              : "Update Role"}

          </button>

        </div>

      </div>

    </div>

  );
};

export default AddRoleModal;