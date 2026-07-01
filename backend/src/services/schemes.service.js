import { db } from "../config/db.js";
import { schemesFallback } from "../data/schemes.fallback.js";

function normalizeSchemeRow(row) {
  return {
    scheme_id: row.scheme_id,
    scheme_name: row.scheme_name ?? "Unknown Scheme",
    state: row.state ?? "Central",
    category: row.category ?? row.department ?? "General",
    benefits: row.benefits ?? row.description ?? "Not specified",
    apply_link: row.apply_link ?? "#",
    rules_verified: Number(row.rules_verified ?? 0),
    min_age: row.min_age ?? null,
    max_age: row.max_age ?? null,
    income_max: row.income_max ?? null,
    gender_allowed: row.gender_allowed ?? "Any",
    eligibility: row.eligibility ?? "Refer official scheme details.",
    documents: row.documents ?? "Not specified",
    rule_source: row.rule_source ?? null,
  };
}

const NEW_SCHEMA_TO_LEGACY_SELECT = `
  SELECT
    COALESCE(id, scheme_id) AS scheme_id,
    COALESCE(name, scheme_name) AS scheme_name,
    COALESCE(state, 'Central') AS state,
    'General' AS category,
    COALESCE(description, eligibility, 'Refer official scheme details.') AS eligibility,
    COALESCE(benefits, description, 'Not specified') AS benefits,
    COALESCE(documents_required, documents) AS documents,
    COALESCE(official_link, apply_link) AS apply_link,
    age_min AS min_age,
    age_max AS max_age,
    income_limit AS income_max,
    COALESCE(gender, gender_allowed, 'Any') AS gender_allowed,
    CASE
      WHEN income_limit IS NOT NULL
        OR age_min IS NOT NULL
        OR age_max IS NOT NULL
        OR occupation IS NOT NULL
        OR caste_category IS NOT NULL
        OR state IS NOT NULL
        OR land_ownership IS NOT NULL
      THEN 1 ELSE 0
    END AS rules_verified,
    'new-schema' AS rule_source
  FROM schemes
`;

export async function getAllSchemes() {
  try {
    const [rows] = await db.query(`${NEW_SCHEMA_TO_LEGACY_SELECT} ORDER BY COALESCE(id, scheme_id)`);
    if (rows.length > 0) {
      return rows.map(normalizeSchemeRow);
    }
  } catch (error) {
  }

  try {
    const [rows] = await db.query("SELECT * FROM schemes ORDER BY scheme_id");
    return rows.length > 0 ? rows.map(normalizeSchemeRow) : schemesFallback;
  } catch (error) {
    return schemesFallback;
  }
}

export async function getSchemeById(id) {
  try {
    const [rows] = await db.query(
      `${NEW_SCHEMA_TO_LEGACY_SELECT} WHERE COALESCE(id, scheme_id) = ?`,
      [id]
    );
    if (rows[0]) {
      return normalizeSchemeRow(rows[0]);
    }
  } catch (error) {
  }

  try {
    const [rows] = await db.query("SELECT * FROM schemes WHERE scheme_id = ?", [id]);
    if (rows[0]) {
      return normalizeSchemeRow(rows[0]);
    }

    return schemesFallback.find((scheme) => String(scheme.scheme_id) === String(id));
  } catch (error) {
    return schemesFallback.find((scheme) => String(scheme.scheme_id) === String(id));
  }
}

export async function searchSchemes(query) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  const sql = `
    SELECT
      COALESCE(id, scheme_id) AS scheme_id,
      COALESCE(name, scheme_name) AS scheme_name,
      COALESCE(state, 'Central') AS state,
      COALESCE(description, eligibility, '') AS description,
      COALESCE(benefits, description, '') AS benefits,
      COALESCE(official_link, apply_link) AS apply_link,
      COALESCE(gender, gender_allowed, 'Any') AS gender_allowed,
      COALESCE(income_limit, income_max) AS income_max,
      COALESCE(age_min, min_age) AS min_age,
      COALESCE(age_max, max_age) AS max_age,
      occupation,
      caste_category,
      land_ownership
    FROM schemes
    WHERE
      LOWER(COALESCE(name, scheme_name, '')) LIKE ?
      OR LOWER(COALESCE(description, eligibility, '')) LIKE ?
      OR LOWER(COALESCE(benefits, '')) LIKE ?
      OR LOWER(COALESCE(occupation, '')) LIKE ?
    ORDER BY COALESCE(id, scheme_id)
    LIMIT 50
  `;

  const term = `%${normalizedQuery}%`;

  try {
    const [rows] = await db.query(sql, [term, term, term, term]);
    return rows;
  } catch (error) {
    return schemesFallback.filter((scheme) => {
      const text = `${scheme.scheme_name} ${scheme.eligibility} ${scheme.benefits}`.toLowerCase();
      return text.includes(normalizedQuery);
    });
  }
}
