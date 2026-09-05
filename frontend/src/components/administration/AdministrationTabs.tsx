import {
  Users,
  ShieldCheck,
  Building2,
  Activity,
} from "lucide-react";

export type AdminTab =
  | "users"
  | "roles"
  | "companies"
  | "activity";

interface AdministrationTabsProps {
  activeTab: AdminTab;
  onChange: (tab: AdminTab) => void;

  userCount: number;
  roleCount: number;
  companyCount: number;
  activityCount: number;
}

const AdministrationTabs = ({
  activeTab,
  onChange,
  userCount,
  roleCount,
  companyCount,
  activityCount,
}: AdministrationTabsProps) => {

  const tabs = [
    {
      id: "users" as const,
      label: "Users",
      icon: Users,
      count: userCount,
    },
    {
      id: "roles" as const,
      label: "Roles",
      icon: ShieldCheck,
      count: roleCount,
    },
    {
      id: "companies" as const,
      label: "Companies",
      icon: Building2,
      count: companyCount,
    },
    {
      id: "activity" as const,
      label: "Activity Logs",
      icon: Activity,
      count: activityCount,
    },
  ];

  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      <div className="flex flex-wrap gap-2">

                {tabs.map((tab) => {

          const Icon = tab.icon;

          const isActive =
            activeTab === tab.id;

          return (

            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-3 rounded-xl px-5 py-3 transition-all duration-300 ${
                isActive
                  ? "bg-violet-600 text-white shadow-lg"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >

              <Icon size={18} />

              <span className="font-medium">
                {tab.label}
              </span>

              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                }`}
              >
                {tab.count}
              </span>

            </button>

          );

        })}

      </div>

    </div>

  );
};

export default AdministrationTabs;