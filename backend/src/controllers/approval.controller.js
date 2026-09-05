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
  deleteApproval,
} = require("../repositories/approvalQueue.repository");

const { getLeadById } = require("../repositories/leads.repository");
const { createNotification } = require("../repositories/notifications.repository");

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

    const reviewedBy = request.user.id;

    const approval = await updateApprovalStatus(id, status, reviewedBy);

    if (!approval) {
      throw new AppError("Approval not found", 404);
    }

    // NEW — notify whoever will care that a decision was made. Since we
    // don't track "who drafted it" separately, we notify the lead owner.
    try {
      const lead = await getLeadById(approval.lead_id);
      if (lead && lead.owner_id) {
        await createNotification(
          lead.owner_id,
          "APPROVAL_DECIDED",
          `Draft ${status.toLowerCase()}`,
          `Your draft "${approval.draft_subject}" was ${status.toLowerCase()}.`,
          "approval",
          approval.id
        );
      }
    } catch (notifyErr) {
      request.log.error(notifyErr);
    }

    return reply.send({
      success: true,
      message: "Approval status updated successfully",
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
  deleteApprovalHandler,
};