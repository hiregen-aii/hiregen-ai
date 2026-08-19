import {
  UserPlus,
  Mail,
  CalendarCheck,
  CheckCircle,
} from "lucide-react";

const activities = [
  {
    icon: UserPlus,
    color: "bg-violet-500",
    title: "New lead captured",
    description: "Google • Senior Frontend Engineer",
    time: "2 min ago",
  },
  {
    icon: Mail,
    color: "bg-blue-500",
    title: "AI email sent",
    description: "Outreach sent to 12 candidates",
    time: "18 min ago",
  },
  {
    icon: CalendarCheck,
    color: "bg-green-500",
    title: "Interview booked",
    description: "Meeting scheduled with Alex Johnson",
    time: "1 hr ago",
  },
  {
    icon: CheckCircle,
    color: "bg-orange-500",
    title: "Candidate hired",
    description: "Product Designer • Stripe",
    time: "Today",
  },
];

const RecentActivity = () => {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <div className="mb-8 flex items-center justify-between">

        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Recent Activity
        </h2>

      </div>

      {/* Timeline */}

      <div className="flex-1 space-y-6">

        {activities.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={index} className="flex gap-4">

              {/* Icon */}

              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${item.color}`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>

              {/* Content */}

              <div className="flex-1">

                <div className="flex items-start justify-between">

                  <div>

                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {item.description}
                    </p>

                  </div>

                  <span className="text-xs text-slate-400">
                    {item.time}
                  </span>

                </div>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
};

export default RecentActivity;