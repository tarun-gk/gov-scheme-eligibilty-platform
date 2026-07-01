import crypto from "crypto";
import { db } from "../../config/db.js";

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function createSession({ accountId, refreshToken, expiresAt, ipAddress, userAgent }) {
  const tokenHash = sha256(refreshToken);
  const query = `
    INSERT INTO account_sessions (account_id, refresh_token_hash, expires_at, ip_address, user_agent, revoked_at)
    VALUES (?, ?, ?, ?, ?, NULL)
  `;
  const [result] = await db.query(query, [accountId, tokenHash, expiresAt, ipAddress, userAgent]);
  return result.insertId;
}

export async function revokeSessionByToken(refreshToken) {
  const tokenHash = sha256(refreshToken);
  const query = `
    UPDATE account_sessions
    SET revoked_at = CURRENT_TIMESTAMP
    WHERE refresh_token_hash = ? AND revoked_at IS NULL
  `;
  await db.query(query, [tokenHash]);
}

export async function getActiveSessionByToken(refreshToken) {
  const tokenHash = sha256(refreshToken);
  const query = `
    SELECT id, account_id, refresh_token_hash, expires_at, revoked_at
    FROM account_sessions
    WHERE refresh_token_hash = ?
      AND revoked_at IS NULL
      AND expires_at > CURRENT_TIMESTAMP
    LIMIT 1
  `;

  const [rows] = await db.query(query, [tokenHash]);
  return rows[0] || null;
}
