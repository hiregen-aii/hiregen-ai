import AppearanceSettings from "@/components/settings/AppearanceSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import AISettings from "@/components/settings/AISettings";
import SupportSettings from "@/components/settings/SupportSettings";

const SettingsPage = () => {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Manage your application preferences, notifications, security settings, AI features and support information.
        </p>
      </div>

      {/* Appearance */}
      <AppearanceSettings />

      {/* Notifications */}
      <NotificationSettings />

      {/* Security */}
      <SecuritySettings />

      {/* AI Preferences */}
      <AISettings />

      {/* Support */}
      <SupportSettings />
    </div>
  );
};

export default SettingsPage;