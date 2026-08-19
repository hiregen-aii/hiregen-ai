import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Target,
  Send,
  PhoneCall,
  LinkIcon,
  CalendarPlus,
} from "lucide-react";

import type { Lead } from "@/data/leads";

interface LeadDetailsProps {
  selectedLead: Lead | null;

  onScheduleMeeting: (lead: Lead) => void;
}
const LeadDetails = ({
  selectedLead,
  onScheduleMeeting,
}: LeadDetailsProps) => {
  if (!selectedLead) {
    return (
      <div className="flex h-full min-h-[650px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-[#111827]">

        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
          <Building2 className="h-10 w-10 text-violet-600" />
        </div>

        <h2 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">
          Lead Details
        </h2>

        <p className="mt-3 text-center text-slate-500 dark:text-slate-400">
          Select a company from the table
          <br />
          or click the eye icon to view details.
        </p>

      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <div className="flex items-center gap-4">

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30">
          <Building2 className="h-7 w-7 text-violet-600" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {selectedLead.company}
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {selectedLead.type}
          </p>
        </div>

      </div>

      {/* Details */}

      <div className="mt-8 space-y-5">

        <InfoRow
          icon={<User className="h-5 w-5" />}
          label="Contact"
          value={selectedLead.contact}
        />

        <InfoRow
          icon={<Briefcase className="h-5 w-5" />}
          label="Designation"
          value={selectedLead.designation}
        />

        <InfoRow
          icon={<Mail className="h-5 w-5" />}
          label="Email"
          value={selectedLead.email}
        />

        <InfoRow
          icon={<Phone className="h-5 w-5" />}
          label="Phone"
          value={selectedLead.phone}
        />

        <InfoRow
          icon={<Globe className="h-5 w-5" />}
          label="Website"
          value={selectedLead.website}
        />

        <InfoRow
          icon={<Target className="h-5 w-5" />}
          label="Lead Score"
          value={`${selectedLead.score}/100`}
        />

      </div>

      {/* Status */}

      <div className="mt-8">

        <h3 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Current Status
        </h3>

        <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
          {selectedLead.status}
        </span>

      </div>

      {/* Quick Actions */}

      <div className="mt-8">

        <h3 className="mb-4 text-lg font-semibold dark:text-white">
          Quick Actions
        </h3>

        <div className="grid grid-cols-2 gap-3">

          <ActionButton
            icon={<Send className="h-4 w-4" />}
            title="Email"
            onClick={() =>
              window.open(`mailto:${selectedLead.email}`)
            }
          />

          <ActionButton
            icon={<PhoneCall className="h-4 w-4" />}
            title="Call"
            onClick={() =>
              window.open(`tel:${selectedLead.phone}`)
            }
          />

          <ActionButton
            icon={<LinkIcon className="h-4 w-4" />}
            title="Website"
            onClick={() =>
              window.open(selectedLead.website)
            }
          />

          <ActionButton
  icon={<CalendarPlus className="h-4 w-4" />}
  title="Meeting"
  onClick={() => onScheduleMeeting(selectedLead)}
/>

        </div>

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

    <div className="mt-1 text-violet-600">
      {icon}
    </div>

    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="font-medium text-slate-900 dark:text-white">
        {value}
      </p>
    </div>

  </div>
);

interface ActionButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}

const ActionButton = ({
  icon,
  title,
  onClick,
}: ActionButtonProps) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 p-3 transition hover:bg-violet-50 dark:border-slate-700 dark:hover:bg-slate-800"
  >
    {icon}

    <span className="text-sm font-medium">
      {title}
    </span>
  </button>
);

export default LeadDetails;