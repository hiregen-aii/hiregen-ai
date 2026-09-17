const candidateService = require("../services/candidate.service");
const {
  serializeCandidatesToCsv,
  buildCandidatesExcelWorkbook,
} = require("../utils/candidateExporter");

/**
 * Lists candidates with query filters.
 */
const getCandidatesHandler = async (request, reply) => {
  try {
    const {
      search,
      location,
      skill,
      status,
      availability,
      experience,
      minScore,
      limit,
      offset,
    } = request.query || {};

    const candidates = await candidateService.getCandidates({
      search,
      location,
      skill,
      status,
      availability,
      experience,
      minScore,
      limit,
      offset,
    });

    return reply.send({
      success: true,
      data: candidates,
      meta: {
        total: candidates.length,
        limit: limit ? parseInt(limit, 10) : null,
        offset: offset ? parseInt(offset, 10) : 0,
      },
    });
  } catch (err) {
    request.log.error(`[CANDIDATES GET ERROR] ${err.message}`);
    return reply.code(500).send({
      success: false,
      message: "Failed to fetch candidate pool: " + err.message,
    });
  }
};

/**
 * Creates a new candidate.
 */
const createCandidateHandler = async (request, reply) => {
  try {
    const candidate = await candidateService.createCandidate(request.body || {});
    return reply.code(201).send({
      success: true,
      data: candidate,
      message: "Candidate profile added successfully.",
    });
  } catch (err) {
    request.log.error(`[CANDIDATE CREATE ERROR] ${err.message}`);
    return reply.code(400).send({
      success: false,
      message: err.message || "Failed to create candidate.",
    });
  }
};

/**
 * Updates a candidate.
 */
const updateCandidateHandler = async (request, reply) => {
  try {
    const { id } = request.params;
    const candidate = await candidateService.updateCandidate(id, request.body || {});
    return reply.send({
      success: true,
      data: candidate,
      message: "Candidate updated successfully.",
    });
  } catch (err) {
    request.log.error(`[CANDIDATE UPDATE ERROR] ${err.message}`);
    return reply.code(400).send({
      success: false,
      message: err.message || "Failed to update candidate.",
    });
  }
};

/**
 * Deletes a candidate.
 */
const deleteCandidateHandler = async (request, reply) => {
  try {
    const { id } = request.params;
    const success = await candidateService.deleteCandidate(id);
    if (!success) {
      return reply.code(404).send({
        success: false,
        message: "Candidate not found.",
      });
    }
    return reply.send({
      success: true,
      message: "Candidate deleted successfully.",
    });
  } catch (err) {
    request.log.error(`[CANDIDATE DELETE ERROR] ${err.message}`);
    return reply.code(500).send({
      success: false,
      message: err.message || "Failed to delete candidate.",
    });
  }
};

/**
 * Retrieves candidate pool KPI metrics.
 */
const getCandidateStatsHandler = async (request, reply) => {
  try {
    const stats = await candidateService.getCandidateStats();
    return reply.send({
      success: true,
      data: stats,
    });
  } catch (err) {
    request.log.error(`[CANDIDATE STATS ERROR] ${err.message}`);
    return reply.code(500).send({
      success: false,
      message: "Failed to load candidate statistics: " + err.message,
    });
  }
};

/**
 * Triggers live Indian candidate scraping and ingestion.
 */
const syncCandidatesHandler = async (request, reply) => {
  try {
    const result = await candidateService.syncIndianCandidates();
    return reply.send({
      success: true,
      data: result,
      message: `Scanned Indian tech community: ${result.newlyAdded} new candidates ingested, ${result.updatedCount} profiles refreshed.`,
    });
  } catch (err) {
    request.log.error(`[CANDIDATE SYNC ERROR] ${err.message}`);
    return reply.code(500).send({
      success: false,
      message: "Candidate sync failed: " + err.message,
    });
  }
};

/**
 * Dedicated export endpoint for candidates (separate from leads).
 * Supports format=csv and format=xlsx.
 */
const exportCandidatesHandler = async (request, reply) => {
  try {
    const {
      format = "csv",
      search = "",
      location = "",
      skill = "",
      status = "",
      availability = "",
      experience = "",
      minScore = "",
    } = request.query || {};

    const safeFormat = (format || "csv").toLowerCase().trim();
    if (!["csv", "xlsx"].includes(safeFormat)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid format. Supported formats: 'csv', 'xlsx'",
      });
    }

    // Fetch all matching candidates (high limit for full export)
    const candidates = await candidateService.getCandidates({
      search,
      location,
      skill,
      status,
      availability,
      experience,
      minScore,
      limit: 5000,
      offset: 0,
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

    if (safeFormat === "xlsx") {
      const workbook = await buildCandidatesExcelWorkbook(candidates);
      const buffer = await workbook.xlsx.writeBuffer();

      reply
        .header(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        .header(
          "Content-Disposition",
          `attachment; filename="hiregen_candidates_india_${timestamp}.xlsx"`
        )
        .send(buffer);
      return reply;
    }

    const csvData = serializeCandidatesToCsv(candidates);
    reply
      .header("Content-Type", "text/csv; charset=utf-8")
      .header(
        "Content-Disposition",
        `attachment; filename="hiregen_candidates_india_${timestamp}.csv"`
      )
      .send(csvData);
    return reply;
  } catch (err) {
    request.log.error(`[CANDIDATE EXPORT ERROR] ${err.message}`);
    return reply.code(500).send({
      success: false,
      message: "An internal error occurred while exporting candidate data.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

module.exports = {
  getCandidatesHandler,
  createCandidateHandler,
  updateCandidateHandler,
  deleteCandidateHandler,
  getCandidateStatsHandler,
  syncCandidatesHandler,
  exportCandidatesHandler,
};
