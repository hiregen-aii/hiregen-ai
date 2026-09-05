import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Users,
  User,
  Calendar,
} from "lucide-react";

import type { Company } from "@/types/company";

interface CompanyInfoCardProps {
  company: Company;
}

const CompanyInfoCard = ({
  company,
}: CompanyInfoCardProps) => {
  const info = [
    {
      icon: Building2,
      label: "Industry",
      value: company.industry,
      color: "#7C3AED",
    },
    {
      icon: User,
      label: "CEO / Founder",
      value: company.ceo,
      color: "#2563EB",
    },
    {
      icon: Mail,
      label: "Email",
      value: company.email,
      color: "#00C853",
    },
    {
      icon: Phone,
      label: "Phone",
      value: company.phone,
      color: "#F59E0B",
    },
    {
      icon: Globe,
      label: "Website",
      value: company.website,
      color: "#EC4899",
    },
    {
      icon: MapPin,
      label: "Location",
      value: company.location,
      color: "#14B8A6",
    },
    {
      icon: Users,
      label: "Employees",
      value: company.employees.toString(),
      color: "#6366F1",
    },
    {
      icon: Calendar,
      label: "Established",
      value: company.established.toString(),
      color: "#EF4444",
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Company Information
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Basic information about the organization.
        </p>
      </div>

      {/* Content */}

      <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

        {info.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex items-start gap-4 rounded-2xl border border-slate-100 p-4 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                  backgroundColor: `${item.color}20`,
                }}
              >
                <Icon
                  size={22}
                  style={{
                    color: item.color,
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>

                {item.label === "Website" ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block break-all font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {item.value}
                  </a>
                ) : item.label === "Email" ? (
                  <a
                    href={`mailto:${company.email}`}
                    className="mt-1 block break-all font-semibold text-green-600 hover:underline dark:text-green-400"
                  >
                    {item.value}
                  </a>
                ) : item.label === "Phone" ? (
                  <a
                    href={`tel:${company.phone}`}
                    className="mt-1 block font-semibold text-orange-600 hover:underline dark:text-orange-400"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-1 break-words font-semibold text-slate-900 dark:text-white">
                    {item.value}
                  </p>
                )}

              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
};

export default CompanyInfoCard;