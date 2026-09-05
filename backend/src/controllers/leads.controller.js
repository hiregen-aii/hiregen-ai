// Team 2 (2.5 Lead Management) — Owner: Kanduru Rakshitha
// Built by Akshita; renamed to match project convention (kebab-case +
// .controller.js) and wired to the real Research Agent (2.4, Arpita) below.

const {
  createLead,
  getAllLeads,
  getLeadById,
  updateLeadStage,
  updateLeadOwner,
  updateLeadScore,
} = require("../repositories/leads.repository");

const AppError = require("../utils/AppError");
const { runResearchPipeline } = require("../agents/research.agent");
const { createNotification } = require("../repositories/notifications.repository");

// Create Lead
const createLeadHandler = async (request, reply) => {
  try {
    const {
      hiringSignalId,
      companyId,
      primaryContactId,
      ownerId,
      stage,
      hiringType,
      fitScore,
    } = request.body;

    const lead = await createLead(
      hiringSignalId,
      companyId,
      primaryContactId,
      ownerId,
      stage,
      hiringType,
      fitScore
    );

    return reply.code(201).send({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({
      success: false,
      message: err.message,
    });
  }
};

const getAllLeadsHandler = async (request, reply) => {
  try {
    const leads = await getAllLeads();
    return reply.send({ success: true, data: leads });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({
      success: false,
      message: err.message,
    });
  }
};

const getLeadByIdHandler = async (request, reply) => {
  try {
    const { id } = request.params;
    const lead = await getLeadById(id);

    if (!lead) {
      throw new AppError("Lead not found", 404);
    }

    return reply.send({ success: true, data: lead });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({
      success: false,
      message: err.message,
    });
  }
};

const updateLeadHandler = async (request, reply) => {
  try {
    const { id } = request.params;
    const { stage, ownerId, fitScore } = request.body;

    if (stage === undefined && ownerId === undefined && fitScore === undefined) {
      throw new AppError(
        "Nothing to update. Provide stage, ownerId or fitScore.",
        400
      );
    }

    let lead = await getLeadById(id);
    if (!lead) {
      throw new AppError("Lead not found", 404);
    }

    const previousStage = lead.stage;

    if (stage !== undefined) {
      lead = await updateLeadStage(id, stage);
    }
    if (ownerId !== undefined) {
      lead = await updateLeadOwner(id, ownerId);
    }
    if (fitScore !== undefined) {
      lead = await updateLeadScore(id, fitScore);
    }

    // NEW — notify the lead's owner when the stage actually changed to
    // MEETING_BOOKED (the one stage transition worth flagging for now).
    if (stage !== undefined && stage !== previousStage && stage === "MEETING_BOOKED" && lead.owner_id) {
      try {
        await createNotification(
          lead.owner_id,
          "MEETING_BOOKED",
          "Meeting booked",
          "A lead you own just moved to Meeting Booked.",
          "lead",
          lead.id
        );
      } catch (notifyErr) {
        request.log.error(notifyErr);
      }
    }

    return reply.send({
      success: true,
      message: "Lead updated successfully",
      data: lead,
    });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({
      success: false,
      message: err.message,
    });
  }
};

// Trigger Research Agent (2.4) for a lead — POST /api/v1/leads/:id/research
//
// FIX: the original version of this handler only checked the lead existed
// and returned a canned "Research request received" message — it never
// actually called the Research Agent. This now calls Arpita's
// runResearchPipeline(), which does the real work: builds the prompt,
// calls the AI Gateway, validates sources against known URLs (no
// hallucinated citations), writes company_research, and updates
// company_memory. Every attempt (success or failure) is logged to
// agent_runs by the agent itself.
const researchLeadHandler = async (request, reply) => {
  try {
    const { id } = request.params;

    const lead = await getLeadById(id);
    if (!lead) {
      throw new AppError("Lead not found", 404);
    }

    const result = await runResearchPipeline(id);

    return reply.send({
      success: true,
      message: "Research completed",
      data: result,
    });
  } catch (err) {
    request.log.error(err);
    // Research can legitimately fail (AI Gateway down, no verifiable
    // sources, etc.) — surface as 422 rather than a generic 500 so the
    // frontend can distinguish "bad input" from "agent couldn't verify
    // this one," and retry/approve-manually accordingly.
    const statusCode = err.statusCode || 422;
    return reply.code(statusCode).send({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createLead: createLeadHandler,
  getAllLeads: getAllLeadsHandler,
  getLeadById: getLeadByIdHandler,
  updateLead: updateLeadHandler,
  researchLead: researchLeadHandler,
};