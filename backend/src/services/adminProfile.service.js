import { db } from "../config/db.js";

let usersPrimaryColumnPromise;

async function getUsersPrimaryColumn() {
  if (!usersPrimaryColumnPromise) {
    usersPrimaryColumnPromise = (async () => {
      try {
        const [rows] = await db.query(
          `
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = DATABASE()
            AND table_name = 'users'
            AND column_name IN ('user_id', 'id')
          ORDER BY FIELD(column_name, 'user_id', 'id')
          LIMIT 1
          `
        );

        return rows?.[0]?.column_name || "id";
      } catch {
        return "id";
      }
    })();
  }

  return usersPrimaryColumnPromise;
}

export async function getProfileManagementStats() {
  const [profileRows] = await db.query("SELECT COUNT(*) AS count FROM user_profiles");
  const [userRows] = await db.query("SELECT COUNT(*) AS count FROM users");
  const [eligibilityRows] = await db.query("SELECT COUNT(*) AS count FROM eligibility_results");

  return {
    totalProfiles: Number(profileRows?.[0]?.count || 0),
    totalUsers: Number(userRows?.[0]?.count || 0),
    totalEligibilityResults: Number(eligibilityRows?.[0]?.count || 0),
  };
}

export async function listProfiles({ limit = 50, offset = 0 } = {}) {
  const usersPrimaryColumn = await getUsersPrimaryColumn();

  const [rows] = await db.query(
    `
    SELECT
      p.id,
      p.user_id,
      p.age,
      p.income,
      p.gender,
      p.occupation,
      p.caste_category,
      p.state,
      p.land_owned,
      p.created_at,
      COALESCE(u.name, JSON_UNQUOTE(JSON_EXTRACT(p.profile_data, '$.name')), 'Unknown') AS name
    FROM user_profiles p
    LEFT JOIN users u ON u.${usersPrimaryColumn} = p.user_id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
    `,
    [Number(limit), Number(offset)]
  );

  return rows;
}

export async function deleteProfileById(profileId) {
  const numericProfileId = Number(profileId);
  if (!Number.isFinite(numericProfileId)) {
    throw new Error("Invalid profile id");
  }

  const [profileRows] = await db.query("SELECT id, user_id FROM user_profiles WHERE id = ?", [
    numericProfileId,
  ]);

  if (!profileRows?.[0]) {
    return {
      deleted: false,
      reason: "Profile not found",
    };
  }

  const userId = profileRows[0].user_id;

  await db.query("DELETE FROM eligibility_results WHERE user_profile_id = ?", [numericProfileId]);
  await db.query("DELETE FROM user_profiles WHERE id = ?", [numericProfileId]);

  if (userId) {
    const usersPrimaryColumn = await getUsersPrimaryColumn();

    const [remainingProfileRows] = await db.query(
      "SELECT COUNT(*) AS count FROM user_profiles WHERE user_id = ?",
      [userId]
    );

    if (Number(remainingProfileRows?.[0]?.count || 0) === 0) {
      await db.query(`DELETE FROM users WHERE ${usersPrimaryColumn} = ?`, [userId]);
      await db.query("DELETE FROM eligibility_results WHERE user_id = ?", [userId]);
    }
  }

  return {
    deleted: true,
    profileId: numericProfileId,
  };
}
