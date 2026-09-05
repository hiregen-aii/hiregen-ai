import type { FastifyInstance } from "fastify";
import { createAnalyticsController } from "../controllers/analytics.controller";
import { AnalyticsService } from "../services/analytics.service";

export async function analyticsRoutes(
  fastify: FastifyInstance,
  analyticsService: AnalyticsService,
) {
  const controller =
    createAnalyticsController(analyticsService);

  fastify.get(
    "/api/v1/analytics/daily",
    {
      schema: {
        tags: ["Analytics"],
        summary: "Get daily analytics metrics",
        querystring: {
          type: "object",
          properties: {
            date: {
              type: "string",
              pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            },
          },
        },
      },
    },
    controller.getDailyAnalytics,
  );
}
