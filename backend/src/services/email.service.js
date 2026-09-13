const nodemailer = require('nodemailer');
const pool = require('../config/db');
const { updateLeadStage } = require('../repositories/leads.repository');
const { createEmailEvent } = require('../repositories/emailEvents.repository');

/**
 * Parses and returns a configured Nodemailer SMTP transporter if SMTP env vars exist.
 */
function getSmtpTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Dispatches an outreach email via the available provider (SMTP, Resend API, or Safe Simulation).
 * Logs the dispatch to `email_events` and updates the lead stage to 'SENT'.
 *
 * @param {Object} params
 * @param {string} params.to Recipient email address
 * @param {string} params.subject Email subject
 * @param {string} params.body Email content (plain text or markdown)
 * @param {string} [params.html] Optional HTML formatted body
 * @param {string} [params.leadId] Associated Lead UUID
 * @param {string} [params.approvalId] Associated Approval Queue UUID
 * @returns {Promise<{ success: boolean, provider: string, messageId: string, simulated: boolean }>}
 */
async function sendOutreachEmail({ to, subject, body, html, leadId, approvalId }) {
  if (!to || !subject || !body) {
    throw new Error('Recipient email (to), subject, and body are required for email dispatch.');
  }

  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || 'outreach@hiregen.ai';
  let provider = 'SIMULATION';
  let messageId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  let simulated = true;

  // 1. Check Resend API
  if (process.env.RESEND_API_KEY) {
    provider = 'RESEND';
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject,
          text: body,
          html: html || `<div style="font-family: sans-serif; white-space: pre-wrap;">${body}</div>`,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Resend API error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      messageId = data.id || messageId;
      simulated = false;
    } catch (err) {
      console.warn(`[EMAIL DISPATCH] Resend failed, falling back: ${err.message}`);
      // Fallback to SMTP if available
      provider = 'FALLBACK_SIMULATION';
    }
  }

  // 2. Check SMTP (Gmail, Zoho, SES, custom)
  if (simulated) {
    const transporter = getSmtpTransporter();
    if (transporter) {
      provider = 'SMTP';
      try {
        const info = await transporter.sendMail({
          from: fromAddress,
          to,
          subject,
          text: body,
          html: html || `<div style="font-family: sans-serif; white-space: pre-wrap;">${body}</div>`,
        });
        messageId = info.messageId || messageId;
        simulated = false;
      } catch (smtpErr) {
        console.warn(`[EMAIL DISPATCH] SMTP error, falling back to simulated log: ${smtpErr.message}`);
        provider = 'FALLBACK_SIMULATION';
      }
    }
  }

  // 3. If simulated mode (no credentials or fallback), log clear notice
  if (simulated) {
    console.log(`[EMAIL DISPATCH] [SIMULATED] Sent to <${to}> | Subject: "${subject}" | ID: ${messageId}`);
  } else {
    console.log(`[EMAIL DISPATCH] [LIVE:${provider}] Dispatched to <${to}> | MessageId: ${messageId}`);
  }

  // 4. Record audit event in database `email_events`
  let recordedEvent = null;
  try {
    const metadata = {
      to,
      from: fromAddress,
      subject,
      provider,
      simulated,
      approvalId: approvalId || null,
      dispatchedAt: new Date().toISOString(),
    };

    recordedEvent = await createEmailEvent(
      leadId || null,
      'DELIVERED',
      messageId,
      metadata,
      new Date().toISOString()
    );
  } catch (auditErr) {
    console.error(`[EMAIL DISPATCH] Failed to record in email_events: ${auditErr.message}`);
  }

  // 5. Advance lead stage to 'SENT' if leadId provided
  if (leadId) {
    try {
      await updateLeadStage(leadId, 'SENT');
    } catch (stageErr) {
      console.warn(`[EMAIL DISPATCH] Failed to update lead ${leadId} stage: ${stageErr.message}`);
    }
  }

  return {
    success: true,
    provider,
    messageId,
    simulated,
    event: recordedEvent,
  };
}

module.exports = {
  sendOutreachEmail,
  getSmtpTransporter,
};
