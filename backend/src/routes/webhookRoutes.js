const { z } = require("zod");

const { runDiscoveryAgent } = require("../agents/discovery.agent");
const {
    createHiringSignal
} = require("../services/hiring-signals.service");
const { verifyWebhookSignature } = require("../middleware/verifyWebhookSignature");

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

module.exports = async function (fastify) {

    // FIX: n8n webhooks previously had zero authentication (only a TODO
    // comment). This captures the raw request body — scoped to just this
    // plugin, doesn't affect JSON parsing anywhere else in the app — so
    // verifyWebhookSignature can check the HMAC against the exact bytes
    // n8n signed, then parses it as JSON as normal.
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

            // TODO
            // Publish normalizedSignal to queue

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

};