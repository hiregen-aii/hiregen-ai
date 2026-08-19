import { X, Eye } from "lucide-react";

import type {
  Company,
  Role,
  User,
} from "@/types/administration";

interface ViewModalProps {
  open: boolean;

  type:
    | "user"
    | "role"
    | "company";

  data:
    | User
    | Role
    | Company
    | null;

  onClose: () => void;
}

const ViewModal = ({
  open,
  type,
  data,
  onClose,
}: ViewModalProps) => {

  if (!open || !data)
    return null;

  const isUser =
    type === "user";

  const isRole =
    type === "role";

  const isCompany =
    type === "company";

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-[#111827]">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">

          <div className="flex items-center gap-3">

            <div className="rounded-full bg-violet-100 p-3 dark:bg-violet-900/30">

              <Eye
                size={22}
                className="text-violet-600"
              />

            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">

                View{" "}

                {isUser
                  ? "User"
                  : isRole
                  ? "Role"
                  : "Company"}

              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                View complete information.
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

        {/* Content */}

        <div className="space-y-6 p-6">

                      {/* User Details */}

          {isUser && (

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <div>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Full Name
                </p>

                <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {(data as User).name}
                </p>

              </div>

              <div>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Email Address
                </p>

                <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {(data as User).email}
                </p>

              </div>

              <div>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Phone Number
                </p>

                <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {(data as User).phone}
                </p>

              </div>

              <div>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Role
                </p>

                <span className="mt-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">

                  {(data as User).role}

                </span>

              </div>

              <div>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Department
                </p>

                <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {(data as User).department}
                </p>

              </div>

              <div>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                    (data as User).status === "Active"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : (data as User).status === "Pending"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {(data as User).status}
                </span>

              </div>

              <div className="md:col-span-2">

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Last Login
                </p>

                <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {(data as User).lastLogin}
                </p>

              </div>

            </div>

          )}

                    {/* Role Details */}

          {isRole && (

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <div>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Role Name
                </p>

                <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {(data as Role).name}
                </p>

              </div>

              <div>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Assigned Users
                </p>

                <span className="mt-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">

                  {(data as Role).users} Users

                </span>

              </div>

              <div className="md:col-span-2">

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Permissions
                </p>

                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">

                  <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                    {(data as Role).permissions}
                  </p>

                </div>

              </div>

              <div className="md:col-span-2">

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                    (data as Role).status === "Active"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                  }`}
                >
                  {(data as Role).status}
                </span>

              </div>

            </div>

          )}

                    {/* Company Details */}

          {isCompany && (

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <div>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Company Name
                </p>

                <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {(data as Company).name}
                </p>

              </div>

              <div>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Company Email
                </p>

                <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {(data as Company).email}
                </p>

              </div>

              <div>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Industry
                </p>

                <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {(data as Company).industry}
                </p>

              </div>

              <div>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Website
                </p>

                <a
                  href={(data as Company).website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block font-semibold text-violet-600 hover:underline dark:text-violet-400"
                >
                  {(data as Company).website}
                </a>

              </div>

              <div>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Phone Number
                </p>

                <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {(data as Company).phone}
                </p>

              </div>

              <div>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Location
                </p>

                <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {(data as Company).location}
                </p>

              </div>

              <div>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Verification
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                    (data as Company).verification === "Verified"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                  }`}
                >
                  {(data as Company).verification}
                </span>

              </div>

              <div>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                    (data as Company).status === "Active"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                  }`}
                >
                  {(data as Company).status}
                </span>

              </div>

            </div>

          )}

                  </div>

        {/* Footer */}

        <div className="flex items-center justify-end border-t border-slate-200 p-6 dark:border-slate-700">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-violet-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:bg-violet-700 hover:shadow-lg"
          >
            Close
          </button>

        </div>

      </div>

    </div>

  );
};

export default ViewModal;