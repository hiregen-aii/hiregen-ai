const {
  getAllMeetings,
  getMeetingById,
  getMeetingsByLead,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} = require('../repositories/meetings.repository');

const { getLeadById, updateLeadStage } = require('../repositories/leads.repository');
const { createNotification } = require('../repositories/notifications.repository');
const AppError = require('../utils/AppError');

// Get All Meetings
const getAllMeetingsHandler = async (request, reply) => {
  try {
    const meetings = await getAllMeetings();

    return reply.send({
      success: true,
      data: meetings,
    });
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({
      success: false,
      message: err.message,
    });
  }
};

// Get Meetings by Lead
const getMeetingsByLeadHandler = async (request, reply) => {
  try {
    const { leadId } = request.params;
    const meetings = await getMeetingsByLead(leadId);

    return reply.send({
      success: true,
      data: meetings,
    });
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({
      success: false,
      message: err.message,
    });
  }
};

// Create Meeting
const createMeetingHandler = async (request, reply) => {
  try {
    const { leadId, meetingTime, meetingLink, notes, date, time, link } = request.body || {};

    if (!leadId) {
      throw new AppError('leadId is required to schedule a meeting', 400);
    }

    // Combine date + time if provided separately
    let finalMeetingTime = meetingTime;
    if (!finalMeetingTime && date) {
      finalMeetingTime = time ? `${date}T${time}:00Z` : `${date}T10:00:00Z`;
    }

    if (!finalMeetingTime) {
      finalMeetingTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }

    const finalLink = meetingLink || link || 'https://meet.google.com/hgr-meet';
    const finalNotes = notes || 'Introductory recruitment sync';

    const meeting = await createMeeting(leadId, finalMeetingTime, finalLink, finalNotes);

    // Update lead stage to MEETING_BOOKED
    try {
      await updateLeadStage(leadId, 'MEETING_BOOKED');
    } catch (stageErr) {
      request.log.warn(`Could not update lead ${leadId} stage: ${stageErr.message}`);
    }

    // Create notification
    const userId = request.user?.id || null;
    if (userId) {
      try {
        const lead = await getLeadById(leadId);
        await createNotification(
          userId,
          'MEETING_BOOKED',
          'Meeting Scheduled',
          `Meeting scheduled for ${new Date(finalMeetingTime).toLocaleString()} with ${lead?.company_name || 'Lead'}.`,
          'lead',
          leadId
        );
      } catch (notifErr) {
        request.log.warn(`Notification notice: ${notifErr.message}`);
      }
    }

    return reply.code(201).send({
      success: true,
      message: 'Meeting scheduled successfully',
      data: meeting,
    });
  } catch (err) {
    request.log.error(err);
    const statusCode = err.statusCode || 500;
    return reply.code(statusCode).send({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getAllMeetings: getAllMeetingsHandler,
  getMeetingsByLead: getMeetingsByLeadHandler,
  createMeeting: createMeetingHandler,
};