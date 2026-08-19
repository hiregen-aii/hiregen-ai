import {
  Mail,
  Phone,
  LinkIcon,
  CalendarDays,
} from "lucide-react";

interface QuickActionsProps {
  onEmail: () => void;
  onCall: () => void;
  onLinkedIn: () => void;
  onMeeting: () => void;
}

const QuickActions = ({
  onEmail,
  onCall,
  onLinkedIn,
  onMeeting,
}: QuickActionsProps) => {
  const actions = [
    {
      title: "Send Email",
      description: "Compose and send an email",
      icon: Mail,
      color: "#2563EB",
      bg: "#DBEAFE",
      onClick: onEmail,
    },
    {
      title: "Call",
      description: "Call the company",
      icon: Phone,
      color: "#16A34A",
      bg: "#DCFCE7",
      onClick: onCall,
    },
    {
      title: "LinkedIn",
      description: "Open company profile",
      icon: LinkIcon,
      color: "#0A66C2",
      bg: "#DBEAFE",
      onClick: onLinkedIn,
    },
    {
      title: "Schedule Meeting",
      description: "Book a meeting",
      icon: CalendarDays,
      color: "#F59E0B",
      bg: "#FEF3C7",
      onClick: onMeeting,
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#111827]">
      {/* Header */}

      <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Quick Actions
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Quickly interact with the company.
        </p>
      </div>

      {/* Actions */}

      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              onClick={action.onClick}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg dark:border-slate-700 dark:hover:border-violet-500"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: action.bg,
                }}
              >
                <Icon
                  size={22}
                  style={{
                    color: action.color,
                  }}
                />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {action.title}
                </h3>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {action.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;