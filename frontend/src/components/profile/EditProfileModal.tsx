import {
  useEffect,
  useState,
} from "react";

import {
  Save,
  User,
  X,
} from "lucide-react";

import { useNotifications } from "@/context/NotificationContext";
import { useProfile } from "@/context/ProfileContext";

import type { EditProfileForm } from "@/types/profile";

interface EditProfileModalProps {
  open: boolean;

  onClose: () => void;
}

const EditProfileModal = ({
  open,
  onClose,
}: EditProfileModalProps) => {

  const {
    profile,
    updateProfile,
    addActivity,
  } = useProfile();

  const {
    addNotification,
  } = useNotifications();

  const [form, setForm] =
    useState<EditProfileForm>({
      name: "",
      designation: "",
      department: "",
      email: "",
      phone: "",
      dob: "",
      gender: "Male",
      address: "",
      city: "",
      state: "",
      country: "",
      manager: "",
      joiningDate: "",
      workLocation: "",
      employmentType: "Full Time",
    });

  useEffect(() => {

    if (!open) return;

    setForm({
      name: profile.name,
      designation: profile.designation,
      department: profile.department,
      email: profile.email,
      phone: profile.phone,
      dob: profile.dob,
      gender: profile.gender,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      country: profile.country,
      manager: profile.manager,
      joiningDate: profile.joiningDate,
      workLocation: profile.workLocation,
      employmentType: profile.employmentType,
    });

  }, [open, profile]);

  const handleInputChange = <
    K extends keyof EditProfileForm
  >(
    field: K,
    value: EditProfileForm[K]
  ) => {

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

  };

  const handleSave = () => {

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.designation.trim() ||
      !form.department.trim()
    ) {

      addNotification({
        title: "Validation Failed",
        message: "Please fill in all required fields.",
        type: "edit",
      });

      return;

    }

    updateProfile(form);

    addActivity({
      id: Date.now(),
      title: "Profile Updated",
      description:
        "Personal and professional information was updated.",
      time: "Just now",
      type: "profile",
    });

    addNotification({
      title: "Profile Updated",
      message:
        "Your profile has been updated successfully.",
      type: "edit",
    });

    onClose();

  };

  if (!open) return null;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#111827]">

                {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">

          <div className="flex items-center gap-4">

            <div className="rounded-xl bg-violet-100 p-3 dark:bg-violet-900/30">

              <User
                size={24}
                className="text-violet-600 dark:text-violet-400"
              />

            </div>

            <div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">

                Edit Profile

              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

                Update your personal and professional information.

              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >

            <X
              size={22}
              className="text-slate-600 dark:text-slate-300"
            />

          </button>

        </div>

        {/* Form */}

        <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-2">

          {/* Personal Information */}

          <div className="space-y-5">

            <h3 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-white">

              Personal Information

            </h3>

            {/* Full Name */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">

                Full Name

              </label>

              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  handleInputChange(
                    "name",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

            </div>

            {/* Email */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">

                Email Address

              </label>

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  handleInputChange(
                    "email",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

            </div>

            {/* Phone */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">

                Phone Number

              </label>

              <input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  handleInputChange(
                    "phone",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

            </div>

            {/* Date of Birth */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">

                Date of Birth

              </label>

              <input
                type="text"
                value={form.dob}
                onChange={(e) =>
                  handleInputChange(
                    "dob",
                    e.target.value
                  )
                }
                placeholder="DD MMM YYYY"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

            </div>

                        {/* Gender */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">

                Gender

              </label>

              <select
                value={form.gender}
                onChange={(e) =>
                  handleInputChange(
                    "gender",
                    e.target.value as
                      | "Male"
                      | "Female"
                      | "Other"
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >

                <option value="Male">Male</option>

                <option value="Female">Female</option>

                <option value="Other">Other</option>

              </select>

            </div>

            {/* Address */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">

                Address

              </label>

              <textarea
                rows={3}
                value={form.address}
                onChange={(e) =>
                  handleInputChange(
                    "address",
                    e.target.value
                  )
                }
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

            </div>

            {/* City */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">

                City

              </label>

              <input
                type="text"
                value={form.city}
                onChange={(e) =>
                  handleInputChange(
                    "city",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

            </div>

            {/* State */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">

                State

              </label>

              <input
                type="text"
                value={form.state}
                onChange={(e) =>
                  handleInputChange(
                    "state",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

            </div>

            {/* Country */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">

                Country

              </label>

              <input
                type="text"
                value={form.country}
                onChange={(e) =>
                  handleInputChange(
                    "country",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

            </div>

          </div>

          {/* Professional Information */}

          <div className="space-y-5">

            <h3 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-white">

              Professional Information

            </h3>

                        {/* Employee ID */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">

                Employee ID

              </label>

              <input
                type="text"
                value={profile.employeeId}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
              />

            </div>

            {/* Designation */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">

                Designation

              </label>

              <input
                type="text"
                value={form.designation}
                onChange={(e) =>
                  handleInputChange(
                    "designation",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

            </div>

            {/* Department */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">

                Department

              </label>

              <input
                type="text"
                value={form.department}
                onChange={(e) =>
                  handleInputChange(
                    "department",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

            </div>

            {/* Reporting Manager */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">

                Reporting Manager

              </label>

              <input
                type="text"
                value={form.manager}
                onChange={(e) =>
                  handleInputChange(
                    "manager",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

            </div>

                        {/* Joining Date */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">

                Joining Date

              </label>

              <input
                type="date"
                value={form.joiningDate}
                onChange={(e) =>
                  handleInputChange(
                    "joiningDate",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

            </div>

            {/* Work Location */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">

                Work Location

              </label>

              <input
                type="text"
                value={form.workLocation}
                onChange={(e) =>
                  handleInputChange(
                    "workLocation",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

            </div>

            {/* Employment Type */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">

                Employment Type

              </label>

              <select
                value={form.employmentType}
                onChange={(e) =>
                  handleInputChange(
                    "employmentType",
                    e.target.value as
                      | "Full Time"
                      | "Part Time"
                      | "Contract"
                      | "Intern"
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >

                <option value="Full Time">
                  Full Time
                </option>

                <option value="Part Time">
                  Part Time
                </option>

                <option value="Contract">
                  Contract
                </option>

                <option value="Intern">
                  Intern
                </option>

              </select>

            </div>

          </div>

        </div>

                {/* Footer */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-6 dark:border-slate-700 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 transition-all duration-300 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >

            Cancel

          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:bg-violet-700 hover:shadow-lg"
          >

            <Save size={18} />

            Save Changes

          </button>

        </div>

      </div>

    </div>

  );

};

export default EditProfileModal;