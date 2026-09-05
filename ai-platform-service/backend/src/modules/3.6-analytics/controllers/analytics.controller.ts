import type { FastifyReply, FastifyRequest } from "fastify";
import { analyticsDailyQuerySchema } from "../schemas/analytics.schema";
import { AnalyticsService } from "../services/analytics.service";

export function createAnalyticsController(
  analyticsService: AnalyticsService,
) {
  return {
    async getDailyAnalytics(
      request: FastifyRequest,
      reply: FastifyReply,
    ) {
      const parsed =
        analyticsDailyQuerySchema.safeParse(request.query);

      if (!parsed.success) {
        return reply.status(400).send({
          success: false,
          data: null,
          error: {
            code: "INVALID_QUERY",
            message: "Invalid analytics query parameters",
          },
          meta: { requestId: request.id },
        });
      }

      const date =
        parsed.data.date ??
        new Date().toISOString().slice(0, 10);

      const data =
        await analyticsService.getDailyAnalytics(date);

      return reply.send({
        success: true,
        data,
        error: null,
        meta: { requestId: request.id },
      });
    },
  };
}
