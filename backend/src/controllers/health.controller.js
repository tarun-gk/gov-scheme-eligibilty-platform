import { db } from "../config/db.js";
import { env } from "../config/env.js";
import { redis } from "../config/redis.js";

export async function healthController(req, res) {
  return res.status(200).json({
    service: "gov-scheme-platform-api",
    timestamp: new Date().toISOString(),
    status: "up",
  });
}

export async function readyController(req, res) {
  const status = {
    service: "gov-scheme-platform-api",
    timestamp: new Date().toISOString(),
    checks: {
      database: "down",
      redis: redis ? "down" : "skipped",
      qdrant: env.QDRANT_URL ? "down" : "skipped",
    },
  };

  try {
    await db.query("SELECT 1");
    status.checks.database = "up";
  } catch {
    status.checks.database = "down";
  }

  if (redis) {
    try {
      await redis.ping();
      status.checks.redis = "up";
    } catch {
      status.checks.redis = "down";
    }
  }

  if (redis) {
    try {
      await redis.ping();
      status.checks.redis = "up";
    } catch {
      status.checks.redis = "down";
    }
  }

  if (env.QDRANT_URL) {
    try {
      const response = await fetch(`${env.QDRANT_URL}/collections/${env.QDRANT_COLLECTION}`);
      status.checks.qdrant = response.ok ? "up" : "down";
    } catch {
      status.checks.qdrant = "down";
    }
  }

  const ok = status.checks.database === "up" && status.checks.redis !== "down" && status.checks.qdrant !== "down";
  return res.status(ok ? 200 : 503).json(status);
}
