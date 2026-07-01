import { db } from "../../config/db.js";

export async function getStakeholderAnalytics({ state = null }) {
  const stateFilter = state ? "AND LOWER(COALESCE(s.state, '')) = ?" : "";
  const params = state ? [String(state).toLowerCase()] : [];

  const [recommendationStats] = await db.query(
    `
    SELECT
      COUNT(*) AS total_recommendations,
      AVG(confidence_score) AS avg_confidence,
      SUM(CASE WHEN eligibility_status = 'Eligible' THEN 1 ELSE 0 END) AS eligible_count,
      SUM(CASE WHEN eligibility_status = 'Possibly Eligible' THEN 1 ELSE 0 END) AS possible_count
    FROM eligibility_results er
    LEFT JOIN schemes s ON s.id = er.scheme_id
    WHERE 1=1 ${stateFilter}
    `,
    params
  );

  const [topSchemes] = await db.query(
    `
    SELECT
      er.scheme_id,
      COALESCE(s.name, CONCAT('Scheme #', er.scheme_id)) AS scheme_name,
      COUNT(*) AS recommendation_count,
      SUM(CASE WHEN er.eligibility_status = 'Eligible' THEN 1 ELSE 0 END) AS eligible_count
    FROM eligibility_results er
    LEFT JOIN schemes s ON s.id = er.scheme_id
    WHERE er.scheme_id IS NOT NULL ${stateFilter}
    GROUP BY er.scheme_id, scheme_name
    ORDER BY recommendation_count DESC
    LIMIT 10
    `,
    params
  );

  return {
    recommendationStats: recommendationStats[0] || {
      total_recommendations: 0,
      avg_confidence: 0,
      eligible_count: 0,
      possible_count: 0,
    },
    topSchemes,
  };
}
