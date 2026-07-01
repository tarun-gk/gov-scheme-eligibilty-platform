import { db } from "../../config/db.js";

export async function getHistoricalSignal({ accountId, schemeIds }) {
  if (!accountId || !Array.isArray(schemeIds) || schemeIds.length === 0) {
    return new Map();
  }

  const parameterSlots = schemeIds.map(() => "?").join(",");
  const query = `
    SELECT
      scheme_id,
      SUM(CASE WHEN event_type = 'applied' THEN 1 ELSE 0 END) AS applied_count,
      SUM(CASE WHEN event_type = 'approved' THEN 1 ELSE 0 END) AS approved_count,
      SUM(CASE WHEN event_type = 'viewed' THEN 1 ELSE 0 END) AS viewed_count
    FROM interaction_events
    WHERE account_id = ?
      AND scheme_id IN (${parameterSlots})
    GROUP BY scheme_id
  `;

  const [rows] = await db.query(query, [accountId, ...schemeIds]);
  const signal = new Map();

  for (const row of rows) {
    const viewed = Number(row.viewed_count || 0);
    const applied = Number(row.applied_count || 0);
    const approved = Number(row.approved_count || 0);

    const score = viewed === 0 ? 0 : Math.min(100, Math.round((applied * 30 + approved * 70) / viewed));
    signal.set(Number(row.scheme_id), score);
  }

  return signal;
}

export async function recordInteractionEvent({
  accountId,
  profileId,
  schemeId,
  eventType,
  eventMetadata = null,
}) {
  const query = `
    INSERT INTO interaction_events
      (account_id, profile_id, scheme_id, event_type, event_metadata)
    VALUES (?, ?, ?, ?, ?)
  `;

  await db.query(query, [
    accountId,
    profileId,
    schemeId,
    eventType,
    eventMetadata ? JSON.stringify(eventMetadata) : null,
  ]);
}
