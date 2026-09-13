const pool = require('../config/db');
const { getLeadById } = require('../repositories/leads.repository');
const { createApproval, getApprovalsByLead, updateApprovalStatus } = require('../repositories/approvalQueue.repository');
const { sendOutreachEmail } = require('./email.service');
const { callAiGateway } = require('./aiGateway.service');

/**
 * Fallback deterministic template when AI gateway is not configured or offline.
 */
function createFallbackDraft({ companyName, contactName, roleTitle, industry }) {
  const cleanContact = contactName || 'Hiring Team';
  const cleanRole = roleTitle || 'Engineering Talent';
  const cleanCompany = companyName || 'your team';

  const subject = `Accelerating ${cleanRole} hiring at ${cleanCompany}`;
  const body = `Hi ${cleanContact},

I noticed ${cleanCompany} is actively seeking an experienced ${cleanRole}${industry ? ` in the ${industry} space` : ''}. 

At HireGen AI, we specialize in surfacing vetted, high-intent technical talent perfectly aligned with your engineering tech stack, reducing time-to-hire by over 50%.

Would you be open to a brief 10-minute introductory call this week to explore candidate profiles matched to your open requisitions?

Best regards,
HireGen Recruitment Intelligence Team`;

  return { subject, body };
}

/**
 * Generates an outreach draft using AI Gateway or deterministic fallback.
 */
async function generateOutreachContent({ companyName, contactName, roleTitle, industry, sourceUrl }) {
  // Try AI Gateway first if any key exists
  const hasKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY || process.env.XAI_API_KEY || process.env.AI_GATEWAY_API_KEY;
  if (hasKey) {
    try {
      const prompt = `Write a high-converting B2B recruitment outreach email to ${contactName || 'Hiring Lead'} at ${companyName} regarding their open role for "${roleTitle}".
Industry: ${industry || 'Technology'}
Posting Source: ${sourceUrl || 'Careers Page'}

Respond with ONLY valid JSON in this exact structure:
{"subject": "Compelling subject line under 9 words", "body": "Professional 3-paragraph outreach body without placeholder brackets"}`;

      const aiRes = await callAiGateway(prompt);
      if (aiRes?.raw?.subject && aiRes?.raw?.body) {
        return {
          subject: aiRes.raw.subject,
          body: aiRes.raw.body,
        };
      }
    } catch (err) {
      console.warn(`[DRAFT GENERATOR] AI Gateway generation notice: ${err.message}. Using high-converting template.`);
    }
  }

  return createFallbackDraft({ companyName, contactName, roleTitle, industry });
}

/**
 * Generates and saves an outreach draft into approval_queue for a specific lead.
 */
async function generateAndQueueDraft(leadId, autoDispatchIfEnabled = true) {
  const leadRes = await pool.query(
    `SELECT l.id, l.fit_score, l.stage,
            c.name AS company_name, c.industry,
            ct.full_name AS contact_name, ct.email AS contact_email,
            hs.role_title, hs.source_url
     FROM leads l
     JOIN companies c ON l.company_id = c.id
     LEFT JOIN contacts ct ON l.primary_contact_id = ct.id
     JOIN hiring_signals hs ON l.hiring_signal_id = hs.id
     WHERE l.id = $1`,
    [leadId]
  );

  if (leadRes.rows.length === 0) {
    throw new Error(`Lead ${leadId} not found`);
  }

  const lead = leadRes.rows[0];

  // Check if draft already exists
  const existing = await getApprovalsByLead(leadId);
  if (existing && existing.length > 0) {
    return existing[0];
  }

  const { subject, body } = await generateOutreachContent({
    companyName: lead.company_name,
    contactName: lead.contact_name,
    roleTitle: lead.role_title,
    industry: lead.industry,
    sourceUrl: lead.source_url,
  });

  const approval = await createApproval(
    lead.id,
    subject,
    body,
    'PENDING',
    1,
    null
  );

  // Check for Autopilot Dispatch
  const autopilotService = require('./autopilot.service');
  const isAutopilot = autopilotService.isAutopilotActive();
  const threshold = autopilotService.getThreshold();
  const isHighFit = (parseFloat(lead.fit_score) || 0) >= threshold;

  if (autoDispatchIfEnabled && isAutopilot && isHighFit) {
    const recipient = lead.contact_email || `recruiting@${lead.company_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    try {
      console.log(`[AUTOPILOT] Dispatching zero-touch email for lead ${lead.id} (${lead.company_name})`);
      await sendOutreachEmail({
        to: recipient,
        subject,
        body,
        leadId: lead.id,
        approvalId: approval.id,
      });

      await updateApprovalStatus(approval.id, 'APPROVED', null);
      approval.status = 'APPROVED';
    } catch (dispatchErr) {
      console.error(`[AUTOPILOT] Auto-dispatch failed for lead ${lead.id}: ${dispatchErr.message}`);
    }
  }

  return approval;
}

/**
 * Ensures pending drafts exist for all active leads that don't have one yet.
 */
async function syncDraftsForActiveLeads(limit = 25) {
  const unDrafted = await pool.query(
    `SELECT l.id
     FROM leads l
     LEFT JOIN approval_queue aq ON l.id = aq.lead_id
     WHERE aq.id IS NULL AND l.stage IN ('NEW', 'RESEARCHED')
     ORDER BY l.fit_score DESC, l.created_at DESC
     LIMIT $1`,
    [limit]
  );

  let createdCount = 0;
  for (const row of unDrafted.rows) {
    try {
      await generateAndQueueDraft(row.id, false);
      createdCount++;
    } catch (err) {
      console.warn(`[DRAFT SYNC] Skipped draft for lead ${row.id}: ${err.message}`);
    }
  }

  return { checked: unDrafted.rows.length, created: createdCount };
}

module.exports = {
  createFallbackDraft,
  generateOutreachContent,
  generateAndQueueDraft,
  syncDraftsForActiveLeads,
};
