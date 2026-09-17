const pool = require('../config/db');
const { getLeadById } = require('../repositories/leads.repository');
const { createApproval, getApprovalsByLead, updateApprovalStatus } = require('../repositories/approvalQueue.repository');
const { sendOutreachEmail } = require('./email.service');
const { callAiGateway } = require('./aiGateway.service');

const DRAFT_SYSTEM_PROMPT = `You are an elite Principal Technical Executive Headhunter and Talent Partner writing bespoke B2B recruitment outreach emails to Engineering Directors, Heads of Talent, and Technical Founders.

Your goal is to write high-converting, deeply personalized, authoritative emails regarding their active engineering requisitions.

Strict Quality & Copywriting Rules:
1. Subject Line:
   - Maximum 7-8 words.
   - Punchy, high open-rate, strictly professional and curiosity-piquing.
   - Examples:
     - "Quick thought on [Company]'s [Role] search"
     - "Pre-vetted [Tech/Role] talent for [Company]"
     - "[Company] [Role] opening: candidate pipeline"
   - STRICTLY AVOID generic spam words like "Accelerating hiring", "Exciting opportunity", "Partnership inquiry", or multiple exclamation marks.

2. Structure (3 crisp, high-impact paragraphs):
   - Paragraph 1 (The Hook): Acknowledge the specific open position at [Company]. Address the technical complexity, scale, or architecture challenges typically involved in that exact discipline (e.g., distributed consensus, high-throughput microservices, low-latency APIs, observability & tracing, reactive frontend architecture, Kubernetes cluster resilience, cloud-native scale).
   - Paragraph 2 (The Solution): Present HireGen AI's technical talent radar. Highlight that we have pre-screened, actively available senior engineers with verified production system design experience, proven GitHub commit velocity, and deep domain expertise directly matched to their stack.
   - Paragraph 3 (The Frictionless Next Step): Provide a low-friction, respectful call to action that makes saying "yes" easy: "Would you be open to reviewing 2-3 anonymized candidate dossiers with architecture scorecards this week?"

3. Personalization & Formatting:
   - Always greet the contact by name (e.g. "Hi [ContactName]," or "Hi [CompanyName] Engineering Team," if no contact name).
   - NEVER output unresolved placeholder brackets like [Name], [Company], or [Your Name]. All names must be concrete.
   - Sign off cleanly as:
Best regards,
HireGen Technical Talent Intelligence
talent@hiregen.ai

Response Schema:
Return ONLY valid JSON in this exact structure:
{"subject": "...", "body": "..."}`;

/**
 * Intelligent domain-tailored fallback template when AI gateway is offline.
 */
function createFallbackDraft({ companyName, contactName, roleTitle, industry }) {
  const cleanCompany = companyName || 'your team';
  const cleanContact = contactName || `${cleanCompany} Engineering Team`;
  const cleanRole = roleTitle || 'Engineering Talent';
  const roleLower = cleanRole.toLowerCase();

  let techContext = "scaling core systems, ensuring uptime, and shipping resilient software architecture";
  let talentPool = "senior software engineers with verified production codebases and high commit velocity";

  if (roleLower.includes('observability') || roleLower.includes('ai') || roleLower.includes('machine learning') || roleLower.includes('ml')) {
    techContext = "architecting reliable AI pipelines, real-time observability telemetry, and low-latency inference workflows";
    talentPool = "specialized AI and platform infrastructure engineers with verified hands-on experience in telemetry and distributed model serving";
  } else if (roleLower.includes('java') || roleLower.includes('backend') || roleLower.includes('api') || roleLower.includes('distributed') || roleLower.includes('go') || roleLower.includes('golang')) {
    techContext = "scaling high-throughput distributed microservices, low-latency API architectures, and resilient database workloads";
    talentPool = "senior backend and distributed systems engineers with proven experience in enterprise microservices and event streaming";
  } else if (roleLower.includes('frontend') || roleLower.includes('ui') || roleLower.includes('full stack') || roleLower.includes('fullstack') || roleLower.includes('react')) {
    techContext = "building mission-critical, high-performance web applications and fluid, accessible user experiences";
    talentPool = "senior fullstack and frontend specialists with deep proficiency in modern TypeScript frameworks and state architectures";
  } else if (roleLower.includes('devops') || roleLower.includes('cloud') || roleLower.includes('sre') || roleLower.includes('platform') || roleLower.includes('infrastructure')) {
    techContext = "ensuring high infrastructure availability, automated CI/CD deployment velocity, and scalable Kubernetes cloud architectures";
    talentPool = "senior cloud infrastructure and platform engineers experienced in automated provisioning and site reliability";
  } else if (roleLower.includes('manager') || roleLower.includes('lead') || roleLower.includes('director') || roleLower.includes('head')) {
    techContext = "driving sprint velocity, technical mentorship, and delivering strategic architectural milestones";
    talentPool = "experienced technical leaders and staff engineers who combine deep architectural depth with team stewardship";
  }

  const subject = `Pre-vetted senior talent for ${cleanCompany}'s ${cleanRole} opening`;
  const body = `Hi ${cleanContact},

I noticed ${cleanCompany} is actively expanding your team with an open requisition for ${cleanRole}. Given the demands of ${techContext} at this scale, identifying candidates with the right production depth is often a significant bottleneck.

At HireGen AI, our technical talent radar has surfaced active, pre-vetted ${talentPool}. Every engineer in our pipeline has been evaluated on hands-on system design, production commit patterns, and immediate technical readiness for your stack.

Would you be open to reviewing 2-3 anonymized candidate dossiers with architecture scorecards this week?

Best regards,
HireGen Technical Talent Intelligence
talent@hiregen.ai`;

  return { subject, body };
}

/**
 * Generates an outreach draft using Groq/Gemini AI Gateway with domain fallback.
 */
async function generateOutreachContent({ companyName, contactName, roleTitle, industry, sourceUrl }) {
  const cleanCompany = companyName || 'your team';
  const cleanContact = contactName || `${cleanCompany} Engineering Team`;
  const cleanRole = roleTitle || 'Software Engineer';

  const hasKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.AI_GATEWAY_API_KEY;
  if (hasKey) {
    try {
      const prompt = `Write an executive B2B recruitment outreach email to ${cleanContact} at ${cleanCompany} for their active role: "${cleanRole}".
Target Industry: ${industry || 'Technology & Engineering'}
Posting Source: ${sourceUrl || 'Careers Page'}

Remember:
- High-converting, peer-to-peer tone.
- Directly speak to the engineering depth of "${cleanRole}".
- Return ONLY valid JSON: {"subject": string, "body": string}`;

      const aiRes = await callAiGateway(prompt, {
        systemPrompt: DRAFT_SYSTEM_PROMPT,
        temperature: 0.35,
      });

      if (aiRes?.raw?.subject && aiRes?.raw?.body) {
        // Clean any accidental residual brackets or placeholders
        let cleanSubject = aiRes.raw.subject.replace(/\[.*?\]/g, '').trim();
        let cleanBody = aiRes.raw.body
          .replace(/\[Name\]/gi, cleanContact)
          .replace(/\[Company\]/gi, cleanCompany)
          .replace(/\[Your Name\]/gi, 'HireGen AI')
          .replace(/\[.*?\]/g, '')
          .trim();

        return {
          subject: cleanSubject || `Talent Pipeline for ${cleanCompany}'s ${cleanRole}`,
          body: cleanBody,
        };
      }
    } catch (err) {
      console.warn(`[DRAFT GENERATOR] AI Gateway notice: ${err.message}. Using intelligent domain template.`);
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
