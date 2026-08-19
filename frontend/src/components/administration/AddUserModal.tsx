import { useState, useEffect } from "react";
import { X, Save, UserPlus } from "lucide-react";

import type {
  AddUserForm,
  User,
} from "@/types/administration";

interface AddUserModalProps {
  open: boolean;
  mode: "add" | "edit";
  user?: User | null;

  onClose: () => void;

  onSave: (
    data: AddUserForm
  ) => void;
}

const AddUserModal = ({
  open,
  mode,
  user,
  onClose,
  onSave,
}: AddUserModalProps) => {

  const emptyForm: AddUserForm = {
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    status: "Active",
  };

  const [form, setForm] =
    useState<AddUserForm>(
      emptyForm
    );

  useEffect(() => {

    if (mode === "edit" && user) {

      setForm({

        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        status: user.status,

      });

    } else {

      setForm(emptyForm);

    }

  }, [mode, user]);

  if (!open) return null;

  const handleChange = (
    field: keyof AddUserForm,
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

      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-[#111827]">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">

          <div className="flex items-center gap-3">

            <div className="rounded-full bg-violet-100 p-3 dark:bg-violet-900/30">

              <UserPlus
                size={22}
                className="text-violet-600"
              />

            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">

                {mode === "add"
                  ? "Add User"
                  : "Edit User"}

              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enter user information below.
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

                      {/* Full Name */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Full Name
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                handleChange("name", e.target.value)
              }
              placeholder="Enter full name"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-violet-900/30"
            />

          </div>

          {/* Email */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Email Address
            </label>

            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                handleChange("email", e.target.value)
              }
              placeholder="Enter email address"
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
                handleChange("phone", e.target.value)
              }
              placeholder="Enter phone number"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-violet-900/30"
            />

          </div>

                    {/* Role */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Role
            </label>

            <select
              value={form.role}
              onChange={(e) =>
                handleChange("role", e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-violet-900/30"
            >

              <option value="">
                Select Role
              </option>

              <option value="Administrator">
                Administrator
              </option>

              <option value="HR Manager">
                HR Manager
              </option>

              <option value="Recruiter">
                Recruiter
              </option>

              <option value="Support Executive">
                Support Executive
              </option>

              <option value="Viewer">
                Viewer
              </option>

            </select>

          </div>

          {/* Department */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Department
            </label>

            <input
              type="text"
              value={form.department}
              onChange={(e) =>
                handleChange(
                  "department",
                  e.target.value
                )
              }
              placeholder="Enter department"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-violet-900/30"
            />

          </div>

          {/* Status */}

          <div className="md:col-span-2">

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

              <option value="Pending">
                Pending
              </option>

              <option value="Inactive">
                Inactive
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
              ? "Save User"
              : "Update User"}

          </button>

        </div>

      </div>

    </div>
      );
};

export default AddUserModal;