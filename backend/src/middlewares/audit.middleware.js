import { v4 as uuidv4 } from "uuid";
import { createAuditLog } from "../services/core/audit.service.js";

export function requestContext(req, res, next) {
  req.requestId = req.headers["x-request-id"] || uuidv4();
  res.setHeader("x-request-id", req.requestId);
  return next();
}

export function auditSensitive(actionResolver) {
  return async (req, res, next) => {
    const startedAt = Date.now();

    res.on("finish", async () => {
      try {
        if (res.statusCode < 200 || res.statusCode >= 500) return;

        const action = typeof actionResolver === "function"
          ? actionResolver(req, res)
          : String(actionResolver);

        await createAuditLog({
          requestId: req.requestId,
          actorId: req.user?.id || null,
          actorRole: req.user?.role || "anonymous",
          action,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"] || null,
          statusCode: res.statusCode,
          durationMs: Date.now() - startedAt,
        });
      } catch (error) {
        console.error("Failed to write audit log:", error.message);
      }
    });

    return next();
  };
}
