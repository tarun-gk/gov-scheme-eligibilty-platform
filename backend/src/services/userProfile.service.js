import { db } from "../config/db.js";

function normalizePayload(input = {}) {
  return {
    name: String(input.name || "").trim() || null,
    age: input.age ?? null,
    income: input.income ?? null,
    gender: input.gender ?? null,
    occupation: String(input.occupation || "").trim() || null,
    caste_category: input.caste_category ?? null,
    state: String(input.state || "").trim() || null,
    land_owned: input.land_owned ?? null,
  };
}

export async function saveUserProfile(input, accountId) {
  const profile = normalizePayload(input);

  let userId = null;
  let profileId = null;

  try {
    const [userInsert] = await db.query(
      `
      INSERT INTO users (name, age, income, gender, occupation, caste_category, state, land_owned)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        profile.name,
        profile.age,
        profile.income,
        profile.gender,
        profile.occupation,
        profile.caste_category,
        profile.state,
        profile.land_owned,
      ]
    );

    userId = userInsert?.insertId || null;
  } catch (error) {
    console.error("Error inserting into users table:", error.message);
    try {
      const fallbackDob = `${new Date().getFullYear() - (Number(profile.age) || 25)}-01-01`;
      const [legacyInsert] = await db.query(
        `
        INSERT INTO users (name, dob, gender, state, district)
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          profile.name,
          fallbackDob,
          ["Male", "Female", "Other"].includes(String(profile.gender || ""))
            ? profile.gender
            : "Other",
          profile.state || "Unknown",
          null,
        ]
      );

      userId = legacyInsert?.insertId || null;
    } catch (fallbackError) {
      console.error("Error with fallback users insert:", fallbackError.message);
    }
  }

  try {
    const [profileInsert] = await db.query(
      `
      INSERT INTO user_profiles
        (account_id, user_id, profile_data, age, income, gender, occupation, caste_category, state, land_owned)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        accountId || null,
        userId,
        JSON.stringify(profile),
        profile.age,
        profile.income,
        profile.gender,
        profile.occupation,
        profile.caste_category,
        profile.state,
        profile.land_owned,
      ]
    );

    profileId = profileInsert?.insertId || null;
    if (!userId && profileId) {
      userId = profileId;
    }
  } catch (error) {
    console.error("Error inserting into user_profiles table:", error.message);
    throw new Error(`Failed to save profile: ${error.message}`);
  }

  // Retrieve the saved profile from database
  if (!profileId) {
    throw new Error("Profile was not saved - no profileId returned");
  }

  try {
    const savedProfile = await getUserProfileById(profileId, accountId);
    if (!savedProfile) {
      throw new Error("Saved profile could not be retrieved from database");
    }
    return savedProfile;
  } catch (error) {
    console.error("Error retrieving saved profile:", error.message);
    throw new Error(`Profile saved but could not be retrieved: ${error.message}`);
  }
}

export async function getUserProfileById(profileId, accountId) {
  const numericProfileId = Number(profileId);
  if (!Number.isFinite(numericProfileId)) {
    throw new Error("Invalid profile ID");
  }

  try {
    // If accountId provided, enforce ownership
    const query = accountId
      ? "SELECT * FROM user_profiles WHERE id = ? AND account_id = ? LIMIT 1"
      : "SELECT * FROM user_profiles WHERE id = ? LIMIT 1";
    const params = accountId
      ? [numericProfileId, accountId]
      : [numericProfileId];

    const [rows] = await db.query(query, params);
    if (!rows || rows.length === 0) {
      return null;
    }
    return rows[0];
  } catch (error) {
    console.error(`Error fetching profile ${profileId}:`, error.message);
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }
}

export async function getProfilesByAccountId(accountId, { limit = 20, cursor = null } = {}) {
  if (!accountId) {
    return [];
  }

  try {
    const safeLimit = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(100, Number(limit))) : 20;
    const hasCursor = Number.isFinite(Number(cursor));

    const [rows] = await db.query(
      `
      SELECT
        p.id,
        p.account_id,
        p.user_id,
        p.age,
        p.income,
        p.gender,
        p.occupation,
        p.caste_category,
        p.state,
        p.land_owned,
        p.created_at,
        p.profile_data,
        COALESCE(u.name, JSON_UNQUOTE(JSON_EXTRACT(p.profile_data, '$.name')), 'Unknown') AS name
      FROM user_profiles p
      LEFT JOIN users u ON u.id = p.user_id
      WHERE p.account_id = ?
      ${hasCursor ? "AND p.id < ?" : ""}
      ORDER BY p.id DESC
      LIMIT ?
      `,
      hasCursor
        ? [accountId, Number(cursor), safeLimit]
        : [accountId, safeLimit]
    );

    if (!Array.isArray(rows)) {
      console.error("User profiles query returned non-array result");
      return [];
    }

    return rows;
  } catch (error) {
    console.error(`Error fetching profiles for account ${accountId}:`, error.message);
    throw new Error(`Failed to fetch profiles: ${error.message}`);
  }
}
