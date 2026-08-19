import { useMemo, useState } from "react";

import { useNotifications } from "@/context/NotificationContext";
import MeetingSchedulerModal from "@/components/leads/MeetingSchedulerModal";
import LeadStats from "@/components/leads/LeadStats";
import LeadSearchBar from "@/components/leads/LeadSearchBar";
import LeadsTable from "@/components/leads/LeadsTable";
import LeadDetails from "@/components/leads/LeadDetails";
import AddLeadModal from "@/components/leads/AddLeadModal";
import DeleteLeadDialog from "@/components/leads/DeleteLeadDialog";
import Toast from "@/components/common/Toast";

import {
  leads as initialLeads,
  type Lead,
} from "@/data/leads";

const LeadsPage = () => {
  const { addNotification } = useNotifications();

  // Leads

  const [leads, setLeads] =
    useState<Lead[]>(initialLeads);

  // Selected Lead

  const [selectedLead, setSelectedLead] =
    useState<Lead | null>(null);

  // Add / Edit Modal

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [editingLead, setEditingLead] =
    useState<Lead | null>(null);

  // Delete Dialog

  const [showDeleteDialog, setShowDeleteDialog] =
    useState(false);

  const [deleteLead, setDeleteLead] =
    useState<Lead | null>(null);

    // Meeting

const [showMeetingModal, setShowMeetingModal] =
  useState(false);

const [meetingLead, setMeetingLead] =
  useState<Lead | null>(null);

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

  // Search

  const [search, setSearch] = useState("");

  // Source

  const [source, setSource] =
    useState("All Sources");

  // Filters

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [typeFilter, setTypeFilter] =
    useState("All");

  const [scoreFilter, setScoreFilter] =
    useState("All");

  // Filter

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.company
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        lead.contact
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        lead.email
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesSource =
        source === "All Sources" ||
        lead.source === source;

      const matchesStatus =
        statusFilter === "All" ||
        lead.status === statusFilter;

      const matchesType =
        typeFilter === "All" ||
        lead.type === typeFilter;

      const matchesScore =
        scoreFilter === "All" ||
        (scoreFilter === "70+" &&
          lead.score >= 70) ||
        (scoreFilter === "80+" &&
          lead.score >= 80) ||
        (scoreFilter === "90+" &&
          lead.score >= 90);

      return (
        matchesSearch &&
        matchesSource &&
        matchesStatus &&
        matchesType &&
        matchesScore
      );
    });
  }, [
    leads,
    search,
    source,
    statusFilter,
    typeFilter,
    scoreFilter,
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

  // Add / Update

  const handleAddLead = (lead: Lead) => {
    if (editingLead) {
      setLeads((prev) =>
        prev.map((item) =>
          item.id === lead.id ? lead : item
        )
      );

      setSelectedLead(lead);

      addNotification({
        title: "Lead Updated",
        message: `${lead.company} updated successfully.`,
        type: "edit",
      });

      showToast(
        "Lead Updated",
        `${lead.company} updated successfully.`,
        "edit"
      );

      setEditingLead(null);
    } else {
      setLeads((prev) => [lead, ...prev]);

      setSelectedLead(lead);

      addNotification({
        title: "Lead Added",
        message: `${lead.company} added successfully.`,
        type: "success",
      });

      showToast(
        "Lead Added",
        `${lead.company} added successfully.`,
        "success"
      );
    }

    setShowAddModal(false);
  };

  // Edit

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setShowAddModal(true);
  };

  // Delete

  const handleDeleteLead = (lead: Lead) => {
    setDeleteLead(lead);
    setShowDeleteDialog(true);
  };

  // Confirm Delete

  const confirmDeleteLead = (lead: Lead) => {
    setLeads((prev) =>
      prev.filter((item) => item.id !== lead.id)
    );

    if (selectedLead?.id === lead.id) {
      setSelectedLead(null);
    }

    addNotification({
      title: "Lead Deleted",
      message: `${lead.company} deleted successfully.`,
      type: "delete",
    });

    showToast(
      "Lead Deleted",
      `${lead.company} deleted successfully.`,
      "delete"
    );

    setShowDeleteDialog(false);
    setDeleteLead(null);
  };

  const handleScheduleMeeting = (
  date: string,
  time: string,
  link: string,
  notes: string
) => {
  if (!meetingLead) return;

  // Update Lead Status

  setLeads((prev) =>
    prev.map((lead) =>
      lead.id === meetingLead.id
        ? {
            ...lead,
            status: "Meeting",
          }
        : lead
    )
  );

  // Update Selected Lead

  if (selectedLead?.id === meetingLead.id) {
    setSelectedLead({
      ...meetingLead,
      status: "Meeting",
    });
  }

  addNotification({
    title: "Meeting Scheduled",
    message: `Meeting scheduled with ${meetingLead.company}.`,
    type: "meeting",
  });

  showToast(
    "Meeting Scheduled",
    `${meetingLead.company} meeting scheduled successfully.`,
    "meeting"
  );

  console.log({
    company: meetingLead.company,
    date,
    time,
    link,
    notes,
  });

  setShowMeetingModal(false);
  setMeetingLead(null);
};

    return (
    <>
      <div className="space-y-6">

        {/* Header */}

        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Lead Management
          </h1>

          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Manage recruitment leads and outreach campaigns.
          </p>
        </div>

        {/* Stats */}

        <LeadStats />

        {/* Search */}

        <LeadSearchBar
          search={search}
          setSearch={setSearch}
          source={source}
          setSource={setSource}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          scoreFilter={scoreFilter}
          setScoreFilter={setScoreFilter}
          onAddLead={() => {
            setEditingLead(null);
            setShowAddModal(true);
          }}
        />

        {/* Main Content */}

        <div className="grid grid-cols-12 gap-6">

          <div className="col-span-12 xl:col-span-8">

            <LeadsTable
              leads={filteredLeads}
              selectedLead={selectedLead}
              setSelectedLead={setSelectedLead}
              onEditLead={handleEditLead}
              onDeleteLead={handleDeleteLead}
            />

          </div>

          <div className="col-span-12 xl:col-span-4">

            <LeadDetails
  selectedLead={selectedLead}
  onScheduleMeeting={(lead) => {
    setMeetingLead(lead);
    setShowMeetingModal(true);
  }}
/>

          </div>

        </div>

      </div>

      {/* Add / Edit Modal */}

      <AddLeadModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingLead(null);
        }}
        onAddLead={handleAddLead}
        editingLead={editingLead}
        isEditing={editingLead !== null}
      />

      {/* Delete Dialog */}

      <DeleteLeadDialog
        open={showDeleteDialog}
        lead={deleteLead}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeleteLead(null);
        }}
        onConfirm={confirmDeleteLead}
      />

      <MeetingSchedulerModal
  open={showMeetingModal}
  lead={meetingLead}
  onClose={() => {
    setShowMeetingModal(false);
    setMeetingLead(null);
  }}
  onSchedule={handleScheduleMeeting}
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

export default LeadsPage;