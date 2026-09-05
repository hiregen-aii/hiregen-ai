import { ShieldAlert } from "lucide-react";

// BLOCKED — no notifications table, no endpoint. Whatever notifications
// appear elsewhere in the app (e.g. after actions on the Leads page) come
// from NotificationContext, which is pure in-memory React state — nothing
// is fetched from or persisted to the backend. A real version needs a
// notifications table + endpoint (and ideally the Socket.IO server this
// frontend already has a client dependency for, but the backend doesn't
// run — see Phase 8 note) to push them live.
const NotificationsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Notifications</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Stay updated on your leads and campaigns.
        </p>
      </div>

      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 p-10 text-center dark:border-amber-900 dark:bg-amber-950">
        <ShieldAlert className="mb-4 h-10 w-10 text-amber-600 dark:text-amber-400" />
        <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-300">
          Blocked on backend work
        </h2>
        <p className="mt-2 max-w-md text-sm text-amber-700 dark:text-amber-400">
          There's no notifications table or endpoint, and no real-time server
          (Socket.IO client is installed but the backend doesn't run one).
          Notifications shown elsewhere in the app are in-memory only and
          disappear on refresh.
        </p>
      </div>
    </div>
  );
};

export default NotificationsPage;