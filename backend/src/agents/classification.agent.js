// Team 2 (2.5 Lead Management) — Owner: Kanduru Rakshitha
// Classifies hiring_type, urgency, fit_score on the leads table.


const {
  getHiringSignalById,
} = require("../repositories/hiringSignals.repository");

const {
  getLeadByHiringSignal,
  updateFitScore,
  updateLeadUrgency,
} = require("../repositories/leads.repository");

const VALID_HIRING_TYPES = [
  "FULL_TIME",
  "CONTRACT",
  "BULK_HIRING",
  "CAMPUS_DRIVE",
  "INTERN",
];

async function runClassificationAgent(signalId) {
  try {
    // Validate input
    if (!signalId) {
      throw new Error("Hiring Signal ID is required");
    }

    // Fetch Hiring Signal
    const signal = await getHiringSignalById(signalId);

    if (!signal) {
      throw new Error("Hiring signal not found");
    }

    // Validate hiring type
    if (!VALID_HIRING_TYPES.includes(signal.hiring_type)) {
      throw new Error("Invalid hiring type");
    }

    // Fetch Lead
    const lead = await getLeadByHiringSignal(signalId);

    if (!lead) {
      throw new Error("Lead not found for this hiring signal");
    }

    // ----------------------------
    // Rule-Based Lead Scoring
    // ----------------------------

    let fitScore = 50;

    switch (signal.hiring_type) {
      case "FULL_TIME":
        fitScore += 20;
        break;

      case "CONTRACT":
        fitScore += 10;
        break;

      case "BULK_HIRING":
        fitScore += 15;
        break;

      case "CAMPUS_DRIVE":
        fitScore += 12;
        break;

      case "INTERN":
        fitScore += 8;
        break;
    }

    if (signal.role_title) {
      fitScore += 10;
    }

    if (signal.source_url) {
      fitScore += 5;
    }

    if (signal.status === "RESEARCHED") {
      fitScore += 15;
    }

    // Keep score within range
    fitScore = Math.max(0, Math.min(fitScore, 100));

    // ----------------------------
    // Determine Urgency
    // ----------------------------

    let urgency = "LOW";

    if (fitScore >= 85) {
      urgency = "HIGH";
    } else if (fitScore >= 70) {
      urgency = "MEDIUM";
    }

    // ----------------------------
    // Update Database
    // ----------------------------

    await updateFitScore(lead.id, fitScore);
    await updateLeadUrgency(lead.id, urgency);

    // ----------------------------
    // Response
    // ----------------------------

    return {
      success: true,
      message: "Lead classified successfully",
      data: {
        signalId,
        leadId: lead.id,
        hiringType: signal.hiring_type,
        fitScore,
        urgency,
        stage: lead.stage,
      },
    };
  } catch (error) {
    console.error("[Classification Agent]", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

module.exports = {
  runClassificationAgent,
};