// Team 2 (2.5 CRM Timeline) — cross-listed with Team 4 (4.3 Communication
// Service, Vignesh Reddy / Tejaswini).
//
// SRS Module 12 ("CRM & Activity Timeline — full history per
// company/contact") doesn't define its own table — it's meant to be a
// combined view over email_events, meetings, and agent_runs. This
// aggregates those into one normalized, time-sorted feed instead of
// making the frontend/consuming team stitch 3 separate API calls together.

const pool = require('../config/db')

// All events for a single lead, normalized to
// { source, event_type, occurred_at, lead_id, detail }
const getTimelineByLead = async (leadId) => {
  const result = await pool.query(
    `
    SELECT 'email' AS source, event_type, event_time AS occurred_at, lead_id,
           jsonb_build_object('providerMessageId', provider_message_id, 'metadata', metadata) AS detail
    FROM email_events WHERE lead_id = $1

    UNION ALL

    SELECT 'meeting' AS source, 'MEETING_SCHEDULED' AS event_type, meeting_time AS occurred_at, lead_id,
           jsonb_build_object('meetingLink', meeting_link, 'notes', notes) AS detail
    FROM meetings WHERE lead_id = $1

    UNION ALL

    SELECT 'agent_run' AS source, agent_name AS event_type, created_at AS occurred_at, lead_id,
           jsonb_build_object('status', status, 'model', model, 'latencyMs', latency_ms) AS detail
    FROM agent_runs WHERE lead_id = $1

    ORDER BY occurred_at DESC
    `,
    [leadId]
  )
  return result.rows
}

// All events across every lead belonging to a company, plus company-level
// events (hiring signals detected, research completed) that aren't tied
// to a lead at all.
//
// CAVEAT: Enrichment Agent runs (enrichment.agent.js) are logged with
// lead_id = NULL (enrichment happens on a hiring_signal, before a lead
// necessarily exists) — so they won't appear here yet. If enrichment
// activity needs to show up in the company timeline, agent_runs needs a
// nullable company_id column added (a follow-up migration), not solved
// silently here.
const getTimelineByCompany = async (companyId) => {
  const result = await pool.query(
    `
    WITH company_leads AS (
      SELECT id FROM leads WHERE company_id = $1
    )
    SELECT 'email' AS source, event_type, event_time AS occurred_at, lead_id AS related_id,
           jsonb_build_object('providerMessageId', provider_message_id, 'metadata', metadata) AS detail
    FROM email_events WHERE lead_id IN (SELECT id FROM company_leads)

    UNION ALL

    SELECT 'meeting' AS source, 'MEETING_SCHEDULED' AS event_type, meeting_time AS occurred_at, lead_id AS related_id,
           jsonb_build_object('meetingLink', meeting_link, 'notes', notes) AS detail
    FROM meetings WHERE lead_id IN (SELECT id FROM company_leads)

    UNION ALL

    SELECT 'agent_run' AS source, agent_name AS event_type, created_at AS occurred_at, lead_id AS related_id,
           jsonb_build_object('status', status, 'model', model, 'latencyMs', latency_ms) AS detail
    FROM agent_runs WHERE lead_id IN (SELECT id FROM company_leads)

    UNION ALL

    SELECT 'hiring_signal' AS source, ('SIGNAL_' || status) AS event_type, detected_at AS occurred_at, NULL AS related_id,
           jsonb_build_object('roleTitle', role_title, 'source', source, 'status', status) AS detail
    FROM hiring_signals WHERE company_id = $1

    UNION ALL

    SELECT 'research' AS source, 'RESEARCH_COMPLETED' AS event_type, completed_at AS occurred_at, NULL AS related_id,
           jsonb_build_object('summary', summary, 'modelUsed', model_used) AS detail
    FROM company_research WHERE company_id = $1 AND completed_at IS NOT NULL

    ORDER BY occurred_at DESC
    `,
    [companyId]
  )
  return result.rows
}

module.exports = { getTimelineByLead, getTimelineByCompany }