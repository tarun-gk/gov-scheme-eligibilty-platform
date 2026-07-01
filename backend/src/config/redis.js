import Redis from "ioredis";
import { env } from "./env.js";

export const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
    })
  : null;

if (redis) {
  redis.on("error", (error) => {
    console.error("Redis connection error:", error.message);
  });
}
