import { db } from "../../config/db.js";

export async function createAuditLog(entry) {
  const query = `
    INSERT INTO audit_logs
      (request_id, actor_id, actor_role, action, ip_address, user_agent, status_code, duration_ms)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await db.query(query, [
    entry.requestId,
    entry.actorId,
    entry.actorRole,
    entry.action,
    entry.ipAddress,
    entry.userAgent,
    entry.statusCode,
    entry.durationMs,
  ]);
}
