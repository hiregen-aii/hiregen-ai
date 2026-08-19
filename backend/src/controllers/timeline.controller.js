// Team 2 (2.5 CRM Timeline) — cross-listed with Team 4 (4.3 Communication
// Service). Exposes the aggregated timeline from timeline.repository.js.

const { getTimelineByLead, getTimelineByCompany } = require("../repositories/timeline.repository");
const { getLeadById } = require("../repositories/leads.repository");
const { getCompanyById } = require("../repositories/companies.repository");
const AppError = require("../utils/AppError");

// GET /api/v1/leads/:id/timeline
const getLeadTimelineHandler = async (request, reply) => {
  try {
    const { id } = request.params;
    const lead = await getLeadById(id);
    if (!lead) {
      throw new AppError("Lead not found", 404);
    }
    const timeline = await getTimelineByLead(id);
    return reply.send({ success: true, data: { leadId: id, events: timeline } });
  } catch (err) {
    request.log.error(err);
    const statusCode = err.statusCode || 500;
    return reply.code(statusCode).send({ success: false, message: err.message });
  }
};

// GET /api/v1/companies/:id/timeline
const getCompanyTimelineHandler = async (request, reply) => {
  try {
    const { id } = request.params;
    const company = await getCompanyById(id);
    if (!company) {
      throw new AppError("Company not found", 404);
    }
    const timeline = await getTimelineByCompany(id);
    return reply.send({ success: true, data: { companyId: id, events: timeline } });
  } catch (err) {
    request.log.error(err);
    const statusCode = err.statusCode || 500;
    return reply.code(statusCode).send({ success: false, message: err.message });
  }
};

module.exports = { getLeadTimelineHandler, getCompanyTimelineHandler };