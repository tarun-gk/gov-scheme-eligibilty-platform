import { db } from "../../config/db.js";

export async function getSchemeVersionToken() {
  const [rows] = await db.query("SELECT MAX(id) AS version_token FROM schemes");
  return String(rows?.[0]?.version_token || "0");
}

export async function listSchemes({ state = null, limit = 200 } = {}) {
  const params = [];
  let where = "";

  if (state) {
    where = "WHERE LOWER(COALESCE(state, 'central')) = ?";
    params.push(String(state).trim().toLowerCase());
  }

  params.push(limit);

  const query = `
    SELECT
      id,
      name,
      description,
      income_limit,
      age_min,
      age_max,
      gender,
      occupation,
      caste_category,
      state,
      land_ownership,
      benefits,
      documents_required,
      official_link
    FROM schemes
    ${where}
    ORDER BY id
    LIMIT ?
  `;

  const [rows] = await db.query(query, params);
  return rows;
}

export async function getSchemesByIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return [];

  const parameterSlots = ids.map(() => "?").join(",");
  const query = `
    SELECT
      id,
      name,
      description,
      income_limit,
      age_min,
      age_max,
      gender,
      occupation,
      caste_category,
      state,
      land_ownership,
      benefits,
      documents_required,
      official_link
    FROM schemes
    WHERE id IN (${parameterSlots})
  `;

  const [rows] = await db.query(query, ids);
  return rows;
}

export async function getSchemeById(id) {
  const [rows] = await db.query(
    `
    SELECT
      id,
      name,
      description,
      income_limit,
      age_min,
      age_max,
      gender,
      occupation,
      caste_category,
      state,
      land_ownership,
      benefits,
      documents_required,
      official_link
    FROM schemes
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
}
