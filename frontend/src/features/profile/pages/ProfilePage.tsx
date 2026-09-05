import { Mail, ShieldCheck, User, Pencil } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

// This page previously showed skills, activity feed, avatar upload,
// professional info (department, employee ID) — none of that exists on
// the real `users` table (id, email, full_name, role, is_active,
// created_at, updated_at only). There's also no PATCH /users/:id
// endpoint, so editing is disabled rather than faked as local-only state
// that silently reverts on refresh.
const ProfilePage = () => {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-[#111827]">
        <p className="text-slate-500 dark:text-slate-400">No user session found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Your account details.</p>
      </div>

      <div className="rounded-3xl bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-700 p-8 text-white shadow-xl">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 text-3xl font-bold backdrop-blur">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-3xl font-bold">{user.fullName}</h2>
            <span className="mt-2 inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-medium">
              {user.role.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-[#111827]">
        <h3 className="mb-4 text-lg font-semibold dark:text-white">Account Info</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoRow icon={<User className="h-5 w-5" />} label="Full Name" value={user.fullName} />
          <InfoRow icon={<Mail className="h-5 w-5" />} label="Email" value={user.email} />
          <InfoRow icon={<ShieldCheck className="h-5 w-5" />} label="Role" value={user.role.replace("_", " ")} />
        </div>

        <button
          disabled
          title="No profile-update endpoint exists on the backend yet"
          className="mt-6 flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400 disabled:cursor-not-allowed dark:border-slate-700"
        >
          <Pencil className="h-4 w-4" />
          Edit Profile (coming soon)
        </button>

        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          Skills, activity history, department, and a profile photo aren't part of the real user
          record — those need new backend fields and a way to edit them before they can be real.
        </p>
      </div>
    </div>
  );
};

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 text-violet-600">{icon}</div>
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="font-medium text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

export default ProfilePage;