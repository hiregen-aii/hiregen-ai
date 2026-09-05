import { useMemo, useState } from "react";
import { Building2, Globe, Link2, Users, Mail, Calendar, Sparkles, Send } from "lucide-react";

import { useCompanyProfiles } from "@/hooks/useCompanyProfiles";
import { useCompanyTimeline } from "@/hooks/useCompanyTimeline";
import type { CompanyProfile, TimelineEvent } from "@/types/company-profile";

const EVENT_LABELS: Record<TimelineEvent["source"], string> = {
  email: "Email",
  meeting: "Meeting",
  agent_run: "AI Agent Run",
  hiring_signal: "Hiring Signal",
  research: "Research Completed",
};

const EVENT_COLORS: Record<TimelineEvent["source"], string> = {
  email: "#3B82F6",
  meeting: "#F59E0B",
  agent_run: "#8B5CF6",
  hiring_signal: "#22C55E",
  research: "#EC4899",
};

function describeEvent(event: TimelineEvent): string {
  switch (event.source) {
    case "hiring_signal":
      return `${event.detail.roleTitle ?? "Role"} — ${event.detail.status ?? ""}`;
    case "research":
      return String(event.detail.summary ?? "Research completed");
    case "agent_run":
      return `${event.event_type} — ${event.detail.status ?? ""} (${event.detail.model ?? "model"})`;
    case "meeting":
      return String(event.detail.notes ?? "Meeting scheduled");
    case "email":
      return event.event_type;
    default:
      return event.event_type;
  }
}

const CompanyPage = () => {
  const { data: companies, isLoading, isError, error } = useCompanyProfiles();
  const [selected, setSelected] = useState<CompanyProfile | null>(null);
  const [search, setSearch] = useState("");

  const timelineQuery = useCompanyTimeline(selected?.id ?? null);

  const filtered = useMemo(() => {
    const list = companies ?? [];
    const q = search.toLowerCase();
    return list.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.industry ?? "").toLowerCase().includes(q)
    );
  }, [companies, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Companies</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Every company currently being tracked or prospected.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <div className="mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies..."
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-[#1E293B] dark:text-white"
            />
          </div>

          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {error instanceof Error ? error.message : "Failed to load companies"}
            </div>
          )}

          {!isLoading && !isError && (
            <div className="space-y-3">
              {filtered.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">No companies found.</p>
              )}
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                    selected?.id === c.id
                      ? "border-violet-400 bg-violet-50 dark:bg-violet-900/20"
                      : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-[#111827] dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                    <Building2 className="h-6 w-6 text-violet-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">{c.name}</p>
                    <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                      {c.industry ?? "Industry unknown"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-8">
          {!selected ? (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-[#111827]">
              <Building2 className="mb-4 h-10 w-10 text-slate-300" />
              <p className="text-slate-500 dark:text-slate-400">Select a company to view details.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-3xl bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-700 p-8 text-white shadow-xl">
                <div className="flex items-center gap-5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur">
                    <span className="text-3xl font-bold">{selected.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{selected.name}</h2>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {selected.industry && (
                        <span className="rounded-full bg-white/20 px-4 py-1 text-sm font-medium">
                          {selected.industry}
                        </span>
                      )}
                      {selected.size_range && (
                        <span className="rounded-full bg-white/20 px-4 py-1 text-sm font-medium">
                          {selected.size_range} employees
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-[#111827]">
                <h3 className="mb-4 text-lg font-semibold dark:text-white">Company Info</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoRow
                    icon={<Globe className="h-5 w-5" />}
                    label="Website"
                    value={selected.domain ? `https://${selected.domain}` : "Not available"}
                    href={selected.domain ? `https://${selected.domain}` : undefined}
                  />
                  <InfoRow
                    icon={<Link2 className="h-5 w-5" />}
                    label="LinkedIn"
                    value={selected.linkedin_url ?? "Not available"}
                    href={selected.linkedin_url ?? undefined}
                  />
                  <InfoRow icon={<Users className="h-5 w-5" />} label="Company Size" value={selected.size_range ?? "Not available"} />
                  <InfoRow
                    icon={<Calendar className="h-5 w-5" />}
                    label="Tracked Since"
                    value={new Date(selected.created_at).toLocaleDateString()}
                  />
                </div>

                <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  CEO, phone, direct email, document uploads, and a "hiring progress %" aren't part of the
                  real company record — those need new backend fields/tables before they can show real data.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-[#111827]">
                <h3 className="mb-4 text-lg font-semibold dark:text-white">Activity Timeline</h3>

                {timelineQuery.isLoading && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Loading timeline…</p>
                )}

                {timelineQuery.isError && (
                  <p className="text-sm text-red-500">
                    {timelineQuery.error instanceof Error ? timelineQuery.error.message : "Failed to load timeline"}
                  </p>
                )}

                {!timelineQuery.isLoading && !timelineQuery.isError && (timelineQuery.data?.length ?? 0) === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No activity yet for this company's leads.
                  </p>
                )}

                {!timelineQuery.isLoading && (timelineQuery.data?.length ?? 0) > 0 && (
                  <div className="space-y-4">
                    {timelineQuery.data!.map((event, i) => (
                      <div key={i} className="flex items-start gap-3 border-l-2 pl-4" style={{ borderColor: EVENT_COLORS[event.source] }}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="rounded-full px-2 py-0.5 text-xs font-semibold"
                              style={{ backgroundColor: `${EVENT_COLORS[event.source]}20`, color: EVENT_COLORS[event.source] }}
                            >
                              {EVENT_LABELS[event.source]}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(event.occurred_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{describeEvent(event)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-[#111827]">
                <h3 className="mb-4 text-lg font-semibold dark:text-white">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {selected.linkedin_url && (
                    <ActionButton
                      icon={<Link2 className="h-4 w-4" />}
                      title="LinkedIn"
                      onClick={() => window.open(selected.linkedin_url!, "_blank", "noopener,noreferrer")}
                    />
                  )}
                  {selected.domain && (
                    <ActionButton
                      icon={<Globe className="h-4 w-4" />}
                      title="Website"
                      onClick={() => window.open(`https://${selected.domain}`, "_blank", "noopener,noreferrer")}
                    />
                  )}
                  <ActionButton icon={<Mail className="h-4 w-4" />} title="Email" disabled note="No contact email on file" />
                  <ActionButton icon={<Send className="h-4 w-4" />} title="Outreach" disabled note="Not wired up yet" />
                  <ActionButton icon={<Sparkles className="h-4 w-4" />} title="Trigger Research" disabled note="Coming soon" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}

const InfoRow = ({ icon, label, value, href }: InfoRowProps) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 text-violet-600">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="truncate font-medium text-violet-600 hover:underline">
          {value}
        </a>
      ) : (
        <p className="truncate font-medium text-slate-900 dark:text-white">{value}</p>
      )}
    </div>
  </div>
);

interface ActionButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  note?: string;
}

const ActionButton = ({ icon, title, onClick, disabled, note }: ActionButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={note}
    className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 p-4 text-center transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
  >
    {icon}
    <span className="text-xs font-medium">{title}</span>
  </button>
);

export default CompanyPage;