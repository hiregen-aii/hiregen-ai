import type { ConnectionOptions } from "bullmq";

/**
 * Shared Redis connection for all queues/workers in this module.
 * Values come from .env - see .env.example for the required keys.
 *
 * maxRetriesPerRequest MUST be null - BullMQ requires this for its
 * blocking connections (documented BullMQ requirement, not optional).
 */
export const redisConnection: ConnectionOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};
