// Team 4 (Automation) — Campaigns. Repository existed, no controller/route.

const {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} = require("../repositories/campaigns.repository");

const AppError = require("../utils/AppError");

const getAllCampaignsHandler = async (request, reply) => {
  try {
    const campaigns = await getAllCampaigns();
    return reply.send({ success: true, data: campaigns });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({ success: false, message: err.message });
  }
};

const getCampaignByIdHandler = async (request, reply) => {
  try {
    const { id } = request.params;
    const campaign = await getCampaignById(id);

    if (!campaign) {
      throw new AppError("Campaign not found", 404);
    }

    return reply.send({ success: true, data: campaign });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({ success: false, message: err.message });
  }
};

const createCampaignHandler = async (request, reply) => {
  try {
    const { name, hiringType, templateReference, isActive, status } = request.body;

    if (!name) {
      throw new AppError("name is required", 400);
    }

    const normalizedStatus = status ? status.toUpperCase() : "ACTIVE";
    const normalizedHiringType = hiringType ? hiringType.toUpperCase().replace(/\s+/g, "_") : null;

    const campaign = await createCampaign(
      name,
      normalizedHiringType,
      templateReference,
      isActive ?? true,
      normalizedStatus
    );

    return reply.code(201).send({
      success: true,
      message: "Campaign created successfully",
      data: campaign,
    });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({ success: false, message: err.message });
  }
};

const updateCampaignHandler = async (request, reply) => {
  try {
    const { id } = request.params;
    const { name, hiringType, templateReference, isActive, status } = request.body;

    let calculatedIsActive = isActive;
    if (calculatedIsActive === undefined && normalizedStatus) {
      if (normalizedStatus === "ACTIVE") calculatedIsActive = true;
      else if (normalizedStatus === "PAUSED" || normalizedStatus === "ARCHIVED") calculatedIsActive = false;
    }

    const campaign = await updateCampaign(id, name, normalizedHiringType, templateReference, calculatedIsActive, normalizedStatus);

    if (!campaign) {
      throw new AppError("Campaign not found", 404);
    }

    return reply.send({
      success: true,
      message: "Campaign updated successfully",
      data: campaign,
    });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({ success: false, message: err.message });
  }
};

const deleteCampaignHandler = async (request, reply) => {
  try {
    const { id } = request.params;
    await deleteCampaign(id);
    return reply.send({ success: true, message: "Campaign deleted successfully" });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({ success: false, message: err.message });
  }
};

module.exports = {
  getAllCampaignsHandler,
  getCampaignByIdHandler,
  createCampaignHandler,
  updateCampaignHandler,
  deleteCampaignHandler,
};