import type { Job } from "bullmq";
import type { EmailSendJobPayload } from "../types";
// import { sendMail } from "@hiregen/email-service";

export async function processEmailSendJob(job: Job<EmailSendJobPayload>): Promise<void> {
  const { recipient, subject, body, templateId } = job.data;

  if (!recipient || !subject || !body) {
    throw new Error("email-send job rejected: recipient, subject and body are required");
  }

  // await sendMail({ recipient, subject, body, templateId });

  console.log(`[email-send] queued email to ${recipient} (template: ${templateId ?? "none"})`);
}
