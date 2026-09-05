import { useState } from "react";

import {
  Bell,
  CalendarCheck,
  CheckCircle2,
  Mail,
  Megaphone,
  Monitor,
} from "lucide-react";

import { useSettings } from "@/context/SettingsContext";
import { useNotifications } from "@/context/NotificationContext";

interface NotificationOption {
  key:
    | "emailNotifications"
    | "interviewReminders"
    | "approvalNotifications"
    | "campaignUpdates"
    | "desktopNotifications";
  title: string;
  description: string;
  icon: typeof Mail;
}

const notificationOptions: NotificationOption[] = [
  {
    key: "emailNotifications",
    title: "Email Notifications",
    description: "Receive important updates by email.",
    icon: Mail,
  },
  {
    key: "interviewReminders",
    title: "Interview Reminders",
    description: "Get reminders before scheduled interviews.",
    icon: CalendarCheck,
  },
  {
    key: "approvalNotifications",
    title: "Approval Notifications",
    description: "Receive approval queue updates.",
    icon: CheckCircle2,
  },
  {
    key: "campaignUpdates",
    title: "Campaign Updates",
    description: "Stay informed about campaign activity.",
    icon: Megaphone,
  },
  {
    key: "desktopNotifications",
    title: "Desktop Notifications",
    description: "Show notifications on your desktop.",
    icon: Monitor,
  },
];

const NotificationSettings = () => {

  const {
    settings,
    updateNotifications,
  } = useSettings();

  const {
    addNotification,
  } = useNotifications();

  const [notificationSettings, setNotificationSettings] =
    useState(settings.notifications);

  const toggleSetting = (
    key: NotificationOption["key"]
  ) => {

    setNotificationSettings((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));

  };

  return (

    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <div className="border-b border-slate-200 p-6 dark:border-slate-700">

        <div className="flex items-center gap-4">

          <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">

            <Bell
              size={22}
              className="text-blue-600 dark:text-blue-400"
            />

          </div>

          <div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">

              Notifications

            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

              Choose how you want to receive notifications.

            </p>

          </div>

        </div>

      </div>

      {/* Content */}

      <div className="space-y-5 p-6">

        {notificationOptions.map((option) => {

          const Icon = option.icon;

          return (

            <div
              key={option.key}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700"
            >

              <div className="flex items-center gap-4">

                <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">

                  <Icon
                    size={20}
                    className="text-blue-600 dark:text-blue-400"
                  />

                </div>

                <div>

                  <h3 className="font-semibold text-slate-900 dark:text-white">

                    {option.title}

                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400">

                    {option.description}

                  </p>

                </div>

              </div>

              <button
                onClick={() =>
                  toggleSetting(option.key)
                }
                className={`relative h-7 w-14 rounded-full transition-all duration-300 ${
                  notificationSettings[option.key]
                    ? "bg-violet-600"
                    : "bg-slate-300 dark:bg-slate-600"
                }`}
              >

                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${
                    notificationSettings[option.key]
                      ? "left-8"
                      : "left-1"
                  }`}
                />

              </button>

            </div>

          );

        })}

                {/* Footer */}

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-700 sm:flex-row sm:justify-end">

          <button
            onClick={() => {

              addNotification({
                title: "Test Notification",
                message:
                  "This is a test notification from HireGen AI Settings.",
                type: "meeting",
              });

            }}
            className="rounded-xl border border-violet-600 px-6 py-3 font-semibold text-violet-600 transition-all duration-300 hover:bg-violet-50 dark:border-violet-500 dark:text-violet-400 dark:hover:bg-violet-900/20"
          >

            Send Test Notification

          </button>

          <button
            onClick={() => {

              updateNotifications(notificationSettings);

              addNotification({
                title: "Notification Settings Saved",
                message:
                  "Your notification preferences have been updated successfully.",
                type: "success",
              });

            }}
            className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-violet-700 hover:shadow-lg"
          >

            Save Notification Settings

          </button>

        </div>

      </div>

    </div>

  );

};

export default NotificationSettings;