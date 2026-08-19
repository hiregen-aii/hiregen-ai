import { useMemo, useState } from "react";

import { useNotifications } from "@/context/NotificationContext";

import CampaignStats from "@/components/campaigns/CampaignStats";
import CampaignFilters from "@/components/campaigns/CampaignFilters";
import CampaignTable from "@/components/campaigns/CampaignTable";

import NewCampaignModal from "@/components/campaigns/NewCampaignModal";
import EditCampaignModal from "@/components/campaigns/EditCampaignModal";
import CampaignDetailsModal from "@/components/campaigns/CampaignDetailsModal";
import DeleteCampaignModal from "@/components/campaigns/DeleteCampaignModal";

import Toast from "@/components/common/Toast";

import {
  campaignsData,
  campaignStats,
} from "@/data/campaigns";

import type {
  Campaign,
  CampaignFilter,
  CampaignFormData,
  CampaignStats as CampaignStatsType,
} from "@/types/campaign";

const CampaignsPage = () => {
  const { addNotification } =
    useNotifications();

  /* ---------------- Campaign State ---------------- */

  const [campaigns, setCampaigns] =
    useState<Campaign[]>(campaignsData);

  const [stats, setStats] =
    useState<CampaignStatsType>(campaignStats);

  /* ---------------- Selected Campaign ---------------- */

  const [selectedCampaign, setSelectedCampaign] =
    useState<Campaign | null>(null);

  /* ---------------- Filters ---------------- */

  const [filters, setFilters] =
    useState<CampaignFilter>({
      search: "",
      status: "All",
      hiringType: "All",
    });

  /* ---------------- Modals ---------------- */

  const [showNewModal, setShowNewModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  /* ---------------- Toast ---------------- */

  const [toastOpen, setToastOpen] =
    useState(false);

  const [toastTitle, setToastTitle] =
    useState("");

  const [toastMessage, setToastMessage] =
    useState("");

  const [toastType, setToastType] =
    useState<
      | "success"
      | "edit"
      | "delete"
      | "meeting"
    >("success");

  const showToast = (
    title: string,
    message: string,
    type:
      | "success"
      | "edit"
      | "delete"
      | "meeting"
  ) => {
    setToastTitle(title);
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  /* ---------------- Filtered Campaigns ---------------- */

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch =
        campaign.name
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        campaign.template
          .toLowerCase()
          .includes(filters.search.toLowerCase());

      const matchesStatus =
        filters.status === "All" ||
        campaign.status === filters.status;

      const matchesHiringType =
        filters.hiringType === "All" ||
        campaign.hiringType ===
          filters.hiringType;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesHiringType
      );
    });
  }, [campaigns, filters]);

    /* ---------------- Search ---------------- */

  const handleSearch = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      search: value,
    }));
  };

  /* ---------------- Status Filter ---------------- */

  const handleStatusChange = (
    status: CampaignFilter["status"]
  ) => {
    setFilters((prev) => ({
      ...prev,
      status,
    }));
  };

  /* ---------------- Hiring Type Filter ---------------- */

  const handleHiringTypeChange = (
    hiringType: CampaignFilter["hiringType"]
  ) => {
    setFilters((prev) => ({
      ...prev,
      hiringType,
    }));
  };

  /* ---------------- View ---------------- */

  const handleView = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowViewModal(true);
  };

  /* ---------------- Edit ---------------- */

  const handleEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowEditModal(true);
  };

  /* ---------------- Delete ---------------- */

  const handleDelete = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowDeleteModal(true);
  };

  /* ---------------- New Campaign ---------------- */

  const handleNewCampaign = (
    formData: CampaignFormData
  ) => {
    const newCampaign: Campaign = {
      id: Date.now(),

      name: formData.name,

      hiringType: formData.hiringType,

      template: formData.template,

      steps: formData.steps,

      delay: formData.delay,

      approvalRequired:
        formData.approvalRequired,

      status: "Active",

      enrolled: 0,

      openRate: 0,

      replyRate: 0,

      createdAt: new Date().toLocaleDateString(),
    };

    setCampaigns((prev) => [
      newCampaign,
      ...prev,
    ]);

    setStats((prev) => ({
      ...prev,
      totalCampaigns:
        prev.totalCampaigns + 1,
      activeSequences:
        prev.activeSequences + 1,
    }));

    addNotification({
      title: "Campaign Created",
      message: `${newCampaign.name} has been created.`,
      type: "success",
    });

    showToast(
      "Campaign Created",
      `${newCampaign.name} created successfully.`,
      "success"
    );

    setShowNewModal(false);
  };

    /* ---------------- Save Edited Campaign ---------------- */

  const handleSaveCampaign = (
    formData: CampaignFormData
  ) => {
    if (!selectedCampaign) return;

    setCampaigns((prev) =>
      prev.map((campaign) =>
        campaign.id === selectedCampaign.id
          ? {
              ...campaign,
              name: formData.name,
              hiringType: formData.hiringType,
              template: formData.template,
              steps: formData.steps,
              delay: formData.delay,
              approvalRequired:
                formData.approvalRequired,
            }
          : campaign
      )
    );

    addNotification({
      title: "Campaign Updated",
      message: `${formData.name} updated successfully.`,
      type: "edit",
    });

    showToast(
      "Campaign Updated",
      "Campaign updated successfully.",
      "edit"
    );

    setShowEditModal(false);
    setSelectedCampaign(null);
  };

  /* ---------------- Confirm Delete ---------------- */

  const handleConfirmDelete = () => {
    if (!selectedCampaign) return;

    setCampaigns((prev) =>
      prev.filter(
        (campaign) =>
          campaign.id !== selectedCampaign.id
      )
    );

    setStats((prev) => ({
      ...prev,
      totalCampaigns: Math.max(
        0,
        prev.totalCampaigns - 1
      ),
      activeSequences:
        selectedCampaign.status === "Active"
          ? Math.max(
              0,
              prev.activeSequences - 1
            )
          : prev.activeSequences,
      paused:
        selectedCampaign.status === "Paused"
          ? Math.max(0, prev.paused - 1)
          : prev.paused,
      leadsEnrolled: Math.max(
        0,
        prev.leadsEnrolled -
          selectedCampaign.enrolled
      ),
    }));

    addNotification({
      title: "Campaign Deleted",
      message: `${selectedCampaign.name} has been deleted.`,
      type: "delete",
    });

    showToast(
      "Campaign Deleted",
      "Campaign deleted successfully.",
      "delete"
    );

    setShowDeleteModal(false);
    setSelectedCampaign(null);
  };

  /* ---------------- Close Modals ---------------- */

  const closeAllModals = () => {
    setShowNewModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setShowDeleteModal(false);
    setSelectedCampaign(null);
  };

    return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Campaign Management
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Create, manage and monitor recruitment campaigns.
          </p>

        </div>

      </div>

      {/* Statistics */}

      <CampaignStats
        stats={stats}
      />

            {/* Filters */}

      <CampaignFilters
        filters={filters}
        onSearch={handleSearch}
        onStatusChange={handleStatusChange}
        onHiringTypeChange={handleHiringTypeChange}
        onNewCampaign={() => setShowNewModal(true)}
      />

      {/* Campaign Table */}

      <CampaignTable
        campaigns={filteredCampaigns}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

            {/* New Campaign */}

      <NewCampaignModal
        open={showNewModal}
        onClose={closeAllModals}
        onSave={handleNewCampaign}
      />

      {/* Edit Campaign */}

      <EditCampaignModal
        open={showEditModal}
        campaign={selectedCampaign}
        onClose={closeAllModals}
        onSave={handleSaveCampaign}
      />

      {/* View Campaign */}

      <CampaignDetailsModal
        open={showViewModal}
        campaign={selectedCampaign}
        onClose={closeAllModals}
      />

      {/* Delete Campaign */}

      <DeleteCampaignModal
        open={showDeleteModal}
        campaign={selectedCampaign}
        onClose={closeAllModals}
        onDelete={handleConfirmDelete}
      />

      {/* Toast */}

      <Toast
        open={toastOpen}
        title={toastTitle}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />

    </div>
  );
};

export default CampaignsPage;