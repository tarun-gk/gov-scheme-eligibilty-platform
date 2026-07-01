import { db } from "../../config/db.js";
import { env } from "../../config/env.js";

export async function createNotification({ accountId, channel, title, message, payload = null }) {
  const query = `
    INSERT INTO notification_events
      (account_id, channel, title, message, payload, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `;

  const [result] = await db.query(query, [
    accountId,
    channel,
    title,
    message,
    payload ? JSON.stringify(payload) : null,
  ]);

  return result.insertId;
}

export async function dispatchPendingNotifications({ limit = 100 }) {
  const [events] = await db.query(
    `
    SELECT id, account_id, channel, title, message, payload
    FROM notification_events
    WHERE status = 'pending'
    ORDER BY id ASC
    LIMIT ?
    `,
    [limit]
  );

  for (const event of events) {
    const providerEndpoint = env.NOTIFICATION_PROVIDER_URL;
    if (!providerEndpoint) {
      continue;
    }

    try {
      const response = await fetch(providerEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: event.account_id,
          channel: event.channel,
          title: event.title,
          message: event.message,
          payload: event.payload ? JSON.parse(event.payload) : null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Notification provider returned ${response.status}`);
      }

      await db.query("UPDATE notification_events SET status = 'sent', sent_at = CURRENT_TIMESTAMP WHERE id = ?", [event.id]);
    } catch (error) {
      await db.query(
        "UPDATE notification_events SET status = 'failed', failure_reason = ? WHERE id = ?",
        [error.message.slice(0, 500), event.id]
      );
    }
  }

  return events.length;
}
