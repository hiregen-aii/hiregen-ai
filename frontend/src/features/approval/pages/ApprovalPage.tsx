import { useMemo, useState } from "react";

import { useNotifications } from "@/context/NotificationContext";

import ApprovalStats from "@/components/approval/ApprovalStats";
import ApprovalSearchBar from "@/components/approval/ApprovalSearchBar";
import ApprovalTable from "@/components/approval/ApprovalTable";
import ReviewDraftModal from "@/components/approval/ReviewDraftModal";
import ScheduleModal from "@/components/approval/ScheduleModal";
import ConfirmApproveModal from "@/components/approval/ConfirmApproveModal";
import ConfirmRejectModal from "@/components/approval/ConfirmRejectModal";
import Toast from "@/components/common/Toast";

import {
  approvalDrafts as initialDrafts,
  type ApprovalDraft,
} from "@/data/approval";

const ApprovalPage = () => {
  const { addNotification } = useNotifications();

  // Drafts

  const [drafts, setDrafts] =
    useState<ApprovalDraft[]>(initialDrafts);

  // Selected Draft

  const [selectedDraft, setSelectedDraft] =
    useState<ApprovalDraft | null>(null);

  // Search

  const [search, setSearch] = useState("");

  // Filter

  const [status, setStatus] =
    useState("All");

  // Review Modal

  const [showReviewModal, setShowReviewModal] =
    useState(false);

  // Schedule Modal

  const [showScheduleModal, setShowScheduleModal] =
    useState(false);

  // Approve Modal

  const [showApproveModal, setShowApproveModal] =
    useState(false);

  // Reject Modal

  const [showRejectModal, setShowRejectModal] =
    useState(false);

  // Toast

  const [toastOpen, setToastOpen] =
    useState(false);

  const [toastTitle, setToastTitle] =
    useState("");

  const [toastMessage, setToastMessage] =
    useState("");

  const [toastType, setToastType] =
    useState<
      "success" | "edit" | "delete" | "meeting"
    >("success");

  // Search Filter

  const filteredDrafts = useMemo(() => {
    return drafts.filter((draft) => {

      const matchesSearch =
        draft.company
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        draft.contact
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        draft.email
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        draft.jobTitle
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        status === "All" ||
        draft.status === status;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    drafts,
    search,
    status,
  ]);

  // Toast Helper

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

  // Review Draft

  const handleReview = (
    draft: ApprovalDraft
  ) => {
    setSelectedDraft(draft);
    setShowReviewModal(true);
  };

  // Save Draft

  const handleSave = (
    updatedDraft: ApprovalDraft
  ) => {

    setDrafts((prev) =>
      prev.map((draft) =>
        draft.id === updatedDraft.id
          ? updatedDraft
          : draft
      )
    );

    setSelectedDraft(updatedDraft);

    addNotification({
      title: "Draft Updated",
      message: `${updatedDraft.company} draft updated.`,
      type: "edit",
    });

    showToast(
      "Draft Updated",
      `${updatedDraft.company} updated successfully.`,
      "edit"
    );
  };

  // Approve

  const handleApprove = () => {
    setShowApproveModal(true);
  };

  // Reject

  const handleReject = () => {
    setShowRejectModal(true);
  };

  // Schedule

  const handleSchedule = () => {
    setShowScheduleModal(true);
  };

  // Confirm Approve

  const confirmApprove = (
    draft: ApprovalDraft
  ) => {

    const updated = {
      ...draft,
      status: "Approved" as const,
    };

    handleSave(updated);

    setShowApproveModal(false);
    setShowReviewModal(false);

    addNotification({
      title: "Draft Approved",
      message: `${draft.company} approved.`,
      type: "success",
    });

    showToast(
      "Approved",
      `${draft.company} approved successfully.`,
      "success"
    );
  };

  // Confirm Reject

  const confirmReject = (
    draft: ApprovalDraft
  ) => {

    const updated = {
      ...draft,
      status: "Rejected" as const,
    };

    handleSave(updated);

    setShowRejectModal(false);
    setShowReviewModal(false);

    addNotification({
      title: "Draft Rejected",
      message: `${draft.company} rejected.`,
      type: "delete",
    });

    showToast(
      "Rejected",
      `${draft.company} rejected.`,
      "delete"
    );
  };

  // Confirm Schedule

  const confirmSchedule = (
    date: string,
    time: string,
    notes: string
  ) => {

    if (!selectedDraft) return;

    const updated = {
      ...selectedDraft,
      status: "Scheduled" as const,
    };

    handleSave(updated);

    setShowScheduleModal(false);
    setShowReviewModal(false);

    addNotification({
      title: "Draft Scheduled",
      message: `${selectedDraft.company} scheduled for ${date} ${time}.`,
      type: "meeting",
    });

    showToast(
      "Scheduled",
      `${selectedDraft.company} scheduled successfully.`,
      "meeting"
    );

    console.log({
      date,
      time,
      notes,
    });
  };

    return (
    <>
      <div className="space-y-6">

        {/* Header */}

        <div>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Approval Queue
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Review AI-generated outreach emails before sending them to clients.
          </p>

        </div>

        {/* Stats */}

        <ApprovalStats
          drafts={drafts}
        />

        {/* Search */}

        <ApprovalSearchBar
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
        />

        {/* Table */}

        <ApprovalTable
          drafts={filteredDrafts}
          onReview={handleReview}
        />

      </div>

      {/* Review Draft */}

      <ReviewDraftModal
        open={showReviewModal}
        draft={selectedDraft}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedDraft(null);
        }}
        onSave={handleSave}
        onApprove={handleApprove}
        onReject={handleReject}
        onSchedule={handleSchedule}
      />

            {/* Schedule Modal */}

      <ScheduleModal
        open={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={confirmSchedule}
      />

      {/* Approve Dialog */}

      <ConfirmApproveModal
        open={showApproveModal}
        draft={selectedDraft}
        onClose={() => setShowApproveModal(false)}
        onConfirm={confirmApprove}
      />

      {/* Reject Dialog */}

      <ConfirmRejectModal
        open={showRejectModal}
        draft={selectedDraft}
        onClose={() => setShowRejectModal(false)}
        onConfirm={confirmReject}
      />

      {/* Toast */}

      <Toast
        open={toastOpen}
        title={toastTitle}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />
    </>
  );
};

export default ApprovalPage;