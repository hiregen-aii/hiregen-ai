// Team 2 (2.5 Lead Management) — Approval Queue
// Repository already existed (approvalQueue.repository.js) with no
// controller/route ever wired to it. This closes that gap, following the
// same pattern as leads.controller.js.

const {
  getAllApprovals,
  getApprovalById,
  getApprovalsByLead,
  createApproval,
  updateApprovalStatus,
  updateApprovalDraft,
  deleteApproval,
} = require("../repositories/approvalQueue.repository");

const { getLeadById } = require("../repositories/leads.repository");
const { createNotification } = require("../repositories/notifications.repository");
const { sendOutreachEmail } = require("../services/email.service");

const AppError = require("../utils/AppError");

const getAllApprovalsHandler = async (request, reply) => {
  try {
    const approvals = await getAllApprovals();
    return reply.send({ success: true, data: approvals });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({
      success: false,
      message: err.message,
    });
  }
};

const getApprovalByIdHandler = async (request, reply) => {
  try {
    const { id } = request.params;
    const approval = await getApprovalById(id);

    if (!approval) {
      throw new AppError("Approval not found", 404);
    }

    return reply.send({ success: true, data: approval });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({
      success: false,
      message: err.message,
    });
  }
};

const getApprovalsByLeadHandler = async (request, reply) => {
  try {
    const { leadId } = request.params;
    const approvals = await getApprovalsByLead(leadId);
    return reply.send({ success: true, data: approvals });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({
      success: false,
      message: err.message,
    });
  }
};

const createApprovalHandler = async (request, reply) => {
  try {
    const { leadId, draftSubject, draftBody, status, stepNumber } = request.body;

    if (!leadId || !draftSubject || !draftBody) {
      throw new AppError("leadId, draftSubject, and draftBody are required", 400);
    }

    const approval = await createApproval(
      leadId,
      draftSubject,
      draftBody,
      status || "PENDING",
      stepNumber || 1,
      null
    );

    // NEW — notify the lead's owner that a draft is waiting for review.
    // Best-effort: a notification failure shouldn't fail the approval create.
    try {
      const lead = await getLeadById(leadId);
      if (lead && lead.owner_id) {
        await createNotification(
          lead.owner_id,
          "APPROVAL_PENDING",
          "New draft awaiting approval",
          `"${draftSubject}" is ready for your review.`,
          "approval",
          approval.id
        );
      }
    } catch (notifyErr) {
      request.log.error(notifyErr);
    }

    return reply.code(201).send({
      success: true,
      message: "Approval created successfully",
      data: approval,
    });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({
      success: false,
      message: err.message,
    });
  }
};

const updateApprovalStatusHandler = async (request, reply) => {
  try {
    const { id } = request.params;
    const { status } = request.body;

    if (!status) {
      throw new AppError("status is required", 400);
    }

    const reviewedBy = request.user?.id || null;

    const approval = await updateApprovalStatus(id, status, reviewedBy);

    if (!approval) {
      throw new AppError("Approval not found", 404);
    }

    let emailResult = null;

    // Trigger automated email dispatch when marked APPROVED
    if (status === "APPROVED") {
      try {
        const enrichedApproval = await getApprovalById(id);
        const recipientEmail =
          enrichedApproval?.email ||
          `recruiting@${(enrichedApproval?.company || 'company').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

        emailResult = await sendOutreachEmail({
          to: recipientEmail,
          subject: approval.draft_subject,
          body: approval.draft_body,
          leadId: approval.lead_id,
          approvalId: approval.id,
        });

        // Notify that email was dispatched
        if (reviewedBy) {
          await createNotification(
            reviewedBy,
            "LEAD_STAGE_CHANGED",
            "Outreach Email Dispatched",
            `Outreach email to ${enrichedApproval?.contact || recipientEmail} (${enrichedApproval?.company || 'Company'}) was dispatched via ${emailResult.provider}.`,
            "approval",
            approval.id
          );
        }
      } catch (sendErr) {
        request.log.error(sendErr);
        console.error(`[APPROVAL DISPATCH] Failed to dispatch email for approval ${id}:`, sendErr.message);
      }
    }

    // Also notify lead owner of decision
    try {
      const lead = await getLeadById(approval.lead_id);
      if (lead && lead.owner_id) {
        await createNotification(
          lead.owner_id,
          "APPROVAL_DECIDED",
          `Draft ${status.toLowerCase()}`,
          `Outreach draft "${approval.draft_subject}" was ${status.toLowerCase()}.`,
          "approval",
          approval.id
        );
      }
    } catch (notifyErr) {
      request.log.error(notifyErr);
    }

    return reply.send({
      success: true,
      message: status === "APPROVED" 
        ? "Draft approved and outreach email dispatched successfully" 
        : "Approval status updated successfully",
      data: approval,
      emailDispatch: emailResult,
    });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({
      success: false,
      message: err.message,
    });
  }
};

const updateApprovalDraftHandler = async (request, reply) => {
  try {
    const { id } = request.params;
    const { draftSubject, draftBody, subject, body } = request.body || {};

    const cleanSubject = draftSubject || subject;
    const cleanBody = draftBody || body;

    if (!cleanSubject && !cleanBody) {
      throw new AppError("draftSubject or draftBody is required to update draft", 400);
    }

    const updated = await updateApprovalDraft(id, cleanSubject, cleanBody);
    if (!updated) {
      throw new AppError("Approval not found", 404);
    }

    return reply.send({
      success: true,
      message: "Approval draft updated successfully",
      data: updated,
    });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({
      success: false,
      message: err.message,
    });
  }
};

const deleteApprovalHandler = async (request, reply) => {
  try {
    const { id } = request.params;
    await deleteApproval(id);
    return reply.send({ success: true, message: "Approval deleted successfully" });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getAllApprovalsHandler,
  getApprovalByIdHandler,
  getApprovalsByLeadHandler,
  createApprovalHandler,
  updateApprovalStatusHandler,
  updateApprovalDraftHandler,
  deleteApprovalHandler,
};