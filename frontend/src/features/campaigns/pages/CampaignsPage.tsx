import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Megaphone, Plus, Pause, Play, Archive, Trash2 } from "lucide-react";

import { useCampaigns } from "@/hooks/useCampaigns";
import { useAuthStore } from "@/store/auth-store";
import { createCampaign, updateCampaignStatus, deleteCampaign } from "@/services/campaigns.service";
import type { Campaign, CampaignStatus } from "@/types/campaign";

const STATUS_STYLES: Record<CampaignStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  PAUSED: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  ARCHIVED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

const CampaignsPage = () => {
  const queryClient = useQueryClient();
  const role = useAuthStore((s) => s.user?.role);
  const canManage = role === "ADMIN" || role === "MANAGER";

  const { data: campaigns, isLoading, isError, error } = useCampaigns();
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const list = campaigns ?? [];
    return {
      total: list.length,
      active: list.filter((c) => c.status === "ACTIVE").length,
      paused: list.filter((c) => c.status === "PAUSED").length,
      draft: list.filter((c) => c.status === "DRAFT").length,
    };
  }, [campaigns]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setActionError(null);
    try {
      await createCampaign({ name: newName.trim() });
      await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setNewName("");
      setShowNewForm(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to create campaign");
    }
  };

  const handleStatusChange = async (campaign: Campaign, status: CampaignStatus) => {
    setActioningId(campaign.id);
    setActionError(null);
    try {
      await updateCampaignStatus(campaign.id, status);
      await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update campaign");
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (campaign: Campaign) => {
    setActioningId(campaign.id);
    setActionError(null);
    try {
      await deleteCampaign(campaign.id);
      await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete campaign");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Campaign Management</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Create and track outreach campaigns.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowNewForm((v) => !v)}
            className="flex items-center gap-2 self-start rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />
            New Campaign
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatBox label="Total" value={stats.total} color="#7C3AED" />
        <StatBox label="Active" value={stats.active} color="#22C55E" />
        <StatBox label="Paused" value={stats.paused} color="#F59E0B" />
        <StatBox label="Draft" value={stats.draft} color="#64748B" />
      </div>

      {showNewForm && canManage && (
        <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#111827]">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Campaign name..."
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-[#1E293B] dark:text-white"
          />
          <button
            onClick={handleCreate}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Create
          </button>
        </div>
      )}

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {actionError}
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error instanceof Error ? error.message : "Failed to load campaigns"}
        </div>
      )}

      {!isLoading && !isError && (campaigns?.length ?? 0) === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-[#111827]">
          <Megaphone className="mb-3 h-8 w-8 text-slate-300" />
          <p className="text-slate-500 dark:text-slate-400">No campaigns yet.</p>
        </div>
      )}

      {!isLoading && !isError && (campaigns?.length ?? 0) > 0 && (
        <div className="space-y-3">
          {campaigns!.map((campaign) => (
            <div
              key={campaign.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-[#111827]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                  <Megaphone className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{campaign.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {campaign.hiring_type ?? "No hiring type set"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[campaign.status]}`}>
                  {campaign.status}
                </span>

                {canManage && (
                  <div className="flex gap-1">
                    {campaign.status !== "ACTIVE" && (
                      <IconButton
                        icon={<Play className="h-4 w-4" />}
                        title="Activate"
                        onClick={() => handleStatusChange(campaign, "ACTIVE")}
                        disabled={actioningId === campaign.id}
                      />
                    )}
                    {campaign.status === "ACTIVE" && (
                      <IconButton
                        icon={<Pause className="h-4 w-4" />}
                        title="Pause"
                        onClick={() => handleStatusChange(campaign, "PAUSED")}
                        disabled={actioningId === campaign.id}
                      />
                    )}
                    {campaign.status !== "ARCHIVED" && (
                      <IconButton
                        icon={<Archive className="h-4 w-4" />}
                        title="Archive"
                        onClick={() => handleStatusChange(campaign, "ARCHIVED")}
                        disabled={actioningId === campaign.id}
                      />
                    )}
                    <IconButton
                      icon={<Trash2 className="h-4 w-4" />}
                      title="Delete"
                      onClick={() => handleDelete(campaign)}
                      disabled={actioningId === campaign.id}
                      danger
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface StatBoxProps {
  label: string;
  value: number;
  color: string;
}

const StatBox = ({ label, value, color }: StatBoxProps) => (
  <div
    className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#111827]"
    style={{ borderBottom: `3px solid ${color}` }}
  >
    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-1 text-2xl font-bold" style={{ color }}>
      {value}
    </p>
  </div>
);

interface IconButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

const IconButton = ({ icon, title, onClick, disabled, danger }: IconButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`rounded-lg p-2 transition disabled:opacity-40 ${
      danger
        ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
    }`}
  >
    {icon}
  </button>
);

export default CampaignsPage;