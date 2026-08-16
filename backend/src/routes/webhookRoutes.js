const { z } = require("zod");

const { runDiscoveryAgent } = require("../agents/discovery.agent");
const {
    createHiringSignal
} = require("../services/hiring-signals.service");
const { verifyWebhookSignature } = require("../middleware/verifyWebhookSignature");
const { createWorkflowRun } = require("../repositories/workflowRuns.repository");
const { createMeeting } = require("../repositories/meetings.repository");
const { updateLeadStage } = require("../repositories/leads.repository");

const signalSchema = z.object({
    company: z.string().optional(),
    companyName: z.string().optional(),
    organization: z.string().optional(),
    employer: z.string().optional(),

    role: z.string().optional(),
    title: z.string().optional(),
    jobTitle: z.string().optional(),
    position: z.string().optional(),

    description: z.string().optional(),
    jobDescription: z.string().optional(),

    location: z.string().optional(),

    source: z.string().optional(),

    sourceUrl: z.string().optional(),
    url: z.string().optional()
});

const workflowFailureSchema = z.object({
    workflowName: z.string(),
    n8nExecutionId: z.string().optional(),
    status: z.enum(["FAILED", "SUCCEEDED"]).default("FAILED"),
    errorDetail: z.string().optional(),
    finishedAt: z.string().optional(),
    leadId: z.string().uuid().optional()
});

const meetingBookedSchema = z.object({
    leadId: z.string().uuid(),
    meetingTime: z.string(),
    meetingLink: z.string().optional(),
    notes: z.string().optional()
});

module.exports = async function (fastify) {

    fastify.addContentTypeParser(
        "application/json",
        { parseAs: "string" },
        function (req, body, done) {
            req.rawBody = body;
            try {
                const json = body ? JSON.parse(body) : {};
                done(null, json);
            } catch (err) {
                err.statusCode = 400;
                done(err, undefined);
            }
        }
    );

    fastify.addHook("preHandler", verifyWebhookSignature);

    fastify.post("/signal-ingest", async (request, reply) => {

        fastify.log.info("Received hiring signal from n8n.");

        try {

            const payload = signalSchema.parse(request.body || {});

            const normalizedSignal =
                await runDiscoveryAgent(payload);

            const hiringSignal =
                await createHiringSignal({
                    companyName: normalizedSignal.company,
                    source: normalizedSignal.source,
                    sourceUrl: normalizedSignal.sourceUrl,
                    roleTitle: normalizedSignal.role,
                    hiringType: normalizedSignal.hiringType,
                    rawPayload: payload
                });

            fastify.log.info({
                company: normalizedSignal.company,
                role: normalizedSignal.role,
                id: hiringSignal.id
            });

            return reply.code(202).send({
                success: true,
                message: "Hiring signal stored successfully.",
                data: hiringSignal
            });

        } catch (err) {

            fastify.log.error(err);

            if (err instanceof z.ZodError) {

                return reply.code(400).send({
                    success: false,
                    message: "Invalid webhook payload.",
                    requestId: request.id,
                    errors: err.flatten()
                });

            }

            return reply.code(500).send({
                success: false,
                message: "Unable to process hiring signal.",
                requestId: request.id
            });

        }

    });

    fastify.post("/workflow-failure", async (request, reply) => {

        try {

            const payload = workflowFailureSchema.parse(request.body || {});
            const completedAt = payload.finishedAt || new Date().toISOString();

            const run = await createWorkflowRun(
                payload.leadId || null,
                payload.workflowName,
                payload.status,
                payload.n8nExecutionId || null,
                payload.errorDetail || null,
                completedAt,
                completedAt
            );

            fastify.log.error({
                workflowName: payload.workflowName,
                errorDetail: payload.errorDetail,
                runId: run.id
            }, "Workflow failure logged");

            return reply.code(201).send({
                success: true,
                message: "Workflow failure logged.",
                data: run
            });

        } catch (err) {

            fastify.log.error(err);

            if (err instanceof z.ZodError) {
                return reply.code(400).send({
                    success: false,
                    message: "Invalid workflow-failure payload.",
                    requestId: request.id,
                    errors: err.flatten()
                });
            }

            return reply.code(500).send({
                success: false,
                message: "Unable to log workflow failure.",
                requestId: request.id
            });

        }

    });

    fastify.post("/meeting-booked", async (request, reply) => {

        try {

            const payload = meetingBookedSchema.parse(request.body || {});

            const meeting = await createMeeting(
                payload.leadId,
                payload.meetingTime,
                payload.meetingLink || null,
                payload.notes || null
            );

            const updatedLead = await updateLeadStage(payload.leadId, "MEETING_BOOKED");

            fastify.log.info({
                leadId: payload.leadId,
                meetingId: meeting.id
            }, "Meeting booked, lead stage updated");

            return reply.code(201).send({
                success: true,
                message: "Meeting logged and lead stage updated.",
                data: { meeting, lead: updatedLead }
            });

        } catch (err) {

            fastify.log.error(err);

            if (err instanceof z.ZodError) {
                return reply.code(400).send({
                    success: false,
                    message: "Invalid meeting-booked payload.",
                    requestId: request.id,
                    errors: err.flatten()
                });
            }

            return reply.code(500).send({
                success: false,
                message: "Unable to log meeting booking.",
                requestId: request.id
            });

        }

    });

};