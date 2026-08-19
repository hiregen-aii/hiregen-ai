import type { Job } from "bullmq";
import type { EmailSendJobPayload } from "../types";
// import { sendMail } from "@hiregen/email-service"; // Vignesh's Nodemailer/SES wrapper (Module 4.3) - wire in once available

/**
 * CONFIRMED contract (Vignesh Reddy, Module 4.3) - kept intentionally
 * simple: recipient, subject, body, optional templateId. Re-check this
 * shape with him before this goes fully live, he mentioned it may grow.
 */
export async function processEmailSendJob(job: Job<EmailSendJobPayload>): Promise<void> {
  const { recipient, subject, body, templateId } = job.data;

  if (!recipient || !subject || !body) {
    throw new Error("email-send job rejected: recipient, subject and body are all required");
  }

  // TODO: swap in the real call once Vignesh's email service is exposed:
  // await sendMail({ recipient, subject, body, templateId });

  console.log(`[email-send] queued email to ${recipient} (template: ${templateId ?? "none"})`);
}
