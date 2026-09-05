import {
  Bell,
  CheckCircle,
  Pencil,
  Trash2,
  CalendarCheck,
} from "lucide-react";

import { useNotifications } from "@/context/NotificationContext";

const iconMap = {
  success: (
    <CheckCircle className="h-6 w-6 text-green-500" />
  ),
  edit: (
    <Pencil className="h-6 w-6 text-blue-500" />
  ),
  delete: (
    <Trash2 className="h-6 w-6 text-red-500" />
  ),
  meeting: (
    <CalendarCheck className="h-6 w-6 text-violet-500" />
  ),
};

const NotificationsPage = () => {
  const {
    notifications,
    deleteNotification,
    clearNotifications,
  } = useNotifications();

  const getTime = (date: Date) => {
    const diff = Math.floor(
      (Date.now() - new Date(date).getTime()) /
        1000
    );

    if (diff < 60) return "Just now";

    if (diff < 3600)
      return `${Math.floor(diff / 60)} min ago`;

    if (diff < 86400)
      return `${Math.floor(diff / 3600)} hrs ago`;

    return `${Math.floor(diff / 86400)} day(s) ago`;
  };

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex items-start justify-between">

  <div>

    <h1 className="text-3xl font-bold dark:text-white">
      Notifications
    </h1>

    <p className="mt-1 text-slate-500 dark:text-slate-400">
      Stay updated with recent activities.
    </p>

  </div>

  {notifications.length > 0 && (

    <button
      onClick={clearNotifications}
      className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
    >
      Clear All
    </button>

  )}

</div>

      {/* Empty */}

      {notifications.length === 0 && (

        <div className="flex h-[500px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white dark:border-slate-700 dark:bg-[#111827]">

          <Bell className="mb-5 h-16 w-16 text-slate-400" />

          <h2 className="text-xl font-semibold dark:text-white">
            No Notifications
          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Notifications from Lead Management,
            Approval Queue and other modules
            will appear here.
          </p>

        </div>

      )}

      {/* List */}

      {notifications.length > 0 && (

        <div className="space-y-4">

          {notifications.map((notification) => (

            <div
              key={notification.id}
              className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-300 dark:border-slate-700 dark:bg-[#111827]"
            >

              <div className="flex gap-4">

                <div className="mt-1">

                  {iconMap[notification.type]}

                </div>

                <div>

                  <h3 className="font-semibold dark:text-white">
                    {notification.title}
                  </h3>

                  <p className="mt-1 text-slate-500 dark:text-slate-400">
                    {notification.message}
                  </p>

                  <span className="mt-2 block text-xs text-slate-400">
                    {getTime(notification.createdAt)}
                  </span>

                </div>

              </div>

              <button
                onClick={() =>
                  deleteNotification(notification.id)
                }
                className="rounded-lg p-2 transition hover:bg-red-100 dark:hover:bg-red-900/20"
              >

                <Trash2 className="h-5 w-5 text-red-500" />

              </button>

            </div>

          ))}

        </div>

      )}

    </div>
  );
};

export default NotificationsPage;