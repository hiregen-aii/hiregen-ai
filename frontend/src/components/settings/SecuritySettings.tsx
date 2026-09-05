import { useState } from "react";

import {
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
} from "lucide-react";

import { useSettings } from "@/context/SettingsContext";
import { useNotifications } from "@/context/NotificationContext";

const SecuritySettings = () => {

  const {
    settings,
    updateSecurity,
  } = useSettings();

  const {
    addNotification,
  } = useNotifications();

  const [security, setSecurity] =
    useState(settings.security);

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const handleChange = (
    field: keyof typeof security,
    value: string
  ) => {

    setSecurity((previous) => ({
      ...previous,
      [field]: value,
    }));

  };

  const renderPasswordField = (
    label: string,
    field: keyof typeof security,
    visible: boolean,
    toggle: () => void,
    placeholder: string
  ) => (

    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">

        {label}

      </label>

      <div className="relative">

        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

        <input
          type={
            visible
              ? "text"
              : "password"
          }
          value={security[field]}
          onChange={(e) =>
            handleChange(
              field,
              e.target.value
            )
          }
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-12 outline-none transition-all focus:border-violet-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
        />

        <button
          type="button"
          onClick={toggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-violet-600"
        >

          {visible
            ? <EyeOff size={18} />
            : <Eye size={18} />}

        </button>

      </div>

    </div>

  );

  return (

    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <div className="border-b border-slate-200 p-6 dark:border-slate-700">

        <div className="flex items-center gap-4">

          <div className="rounded-xl bg-red-100 p-3 dark:bg-red-900/30">

            <ShieldCheck
              size={22}
              className="text-red-600 dark:text-red-400"
            />

          </div>

          <div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">

              Security

            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

              Change your account password securely.

            </p>

          </div>

        </div>

      </div>

      {/* Content */}

      <div className="space-y-6 p-6">

        {renderPasswordField(
          "Current Password",
          "currentPassword",
          showCurrent,
          () => setShowCurrent(!showCurrent),
          "Enter current password"
        )}

        {renderPasswordField(
          "New Password",
          "newPassword",
          showNew,
          () => setShowNew(!showNew),
          "Enter new password"
        )}

        {renderPasswordField(
          "Confirm Password",
          "confirmPassword",
          showConfirm,
          () => setShowConfirm(!showConfirm),
          "Confirm new password"
        )}

                {/* Footer */}

        <div className="flex justify-end border-t border-slate-200 pt-6 dark:border-slate-700">

          <button
            onClick={() => {

              if (
                !security.currentPassword.trim() ||
                !security.newPassword.trim() ||
                !security.confirmPassword.trim()
              ) {

                addNotification({
                  title: "Missing Information",
                  message: "Please fill in all password fields.",
                  type: "delete",
                });

                return;

              }

              if (security.newPassword.length < 8) {

                addNotification({
                  title: "Weak Password",
                  message: "Password must be at least 8 characters long.",
                  type: "delete",
                });

                return;

              }

              if (
                security.newPassword !==
                security.confirmPassword
              ) {

                addNotification({
                  title: "Password Mismatch",
                  message: "New password and confirm password do not match.",
                  type: "delete",
                });

                return;

              }

              updateSecurity(security);

              addNotification({
                title: "Password Updated",
                message: "Your password has been updated successfully.",
                type: "success",
              });

              setSecurity({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });

              setShowCurrent(false);
              setShowNew(false);
              setShowConfirm(false);

            }}
            className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-violet-700 hover:shadow-lg"
          >

            Update Password

          </button>

        </div>

      </div>

    </div>

  );

};

export default SecuritySettings;