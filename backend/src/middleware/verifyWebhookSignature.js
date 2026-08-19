const crypto = require("crypto");

// Constant-time string comparison — regular === leaks timing information
// that could theoretically help an attacker guess a valid key/signature
// byte by byte. Requires equal-length buffers, so length is checked first.
function safeCompare(a, b) {
    const bufA = Buffer.from(String(a || ""));
    const bufB = Buffer.from(String(b || ""));
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}

// Verifies n8n -> backend webhook calls per SRS §14/§18: a rotating API
// key plus an HMAC-SHA256 signature over the exact raw request body.
// Must run AFTER the raw body has been captured (see the content-type
// parser registered in routes/webhookRoutes.js) and BEFORE the Zod
// schema parses request.body, so it sits as a preHandler hook.
//
// Expected headers from n8n:
//   x-api-key:   the shared API key (rotated periodically)
//   x-signature: hex-encoded HMAC-SHA256 of the raw JSON body, using the
//                shared secret as the HMAC key
function verifyWebhookSignature(request, reply, done) {
    const apiKey = request.headers["x-api-key"];
    const signature = request.headers["x-signature"];

    const expectedApiKey = process.env.N8N_WEBHOOK_API_KEY;
    const secret = process.env.N8N_WEBHOOK_SECRET;

    // Fail closed: if the server isn't configured with a key/secret yet,
    // refuse all webhook traffic rather than silently accepting anything
    // (which is what the old TODO-only version effectively did).
    if (!expectedApiKey || !secret) {
        request.log.error(
            "[WEBHOOK AUTH] N8N_WEBHOOK_API_KEY / N8N_WEBHOOK_SECRET not set in env — rejecting all webhook traffic until configured."
        );
        reply.code(503).send({
            success: false,
            message: "Webhook authentication is not configured on this server.",
        });
        return;
    }

    if (!apiKey || !signature) {
        reply.code(401).send({
            success: false,
            message: "Missing x-api-key or x-signature header.",
        });
        return;
    }

    if (!safeCompare(apiKey, expectedApiKey)) {
        reply.code(401).send({ success: false, message: "Invalid API key." });
        return;
    }

    const rawBody = request.rawBody || "";
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

    if (!safeCompare(signature, expectedSignature)) {
        reply.code(401).send({ success: false, message: "Invalid signature." });
        return;
    }

    done();
}

module.exports = { verifyWebhookSignature };
