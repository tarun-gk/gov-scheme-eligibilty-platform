import {
  deleteProfileById,
  getProfileManagementStats,
  listProfiles,
} from "../services/adminProfile.service.js";

export async function getProfilesController(req, res) {
  try {
    const limit = Number(req.query.limit || 50);
    const offset = Number(req.query.offset || 0);

    const profiles = await listProfiles({
      limit: Number.isFinite(limit) ? limit : 50,
      offset: Number.isFinite(offset) ? offset : 0,
    });

    return res.status(200).json(profiles);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch profiles",
    });
  }
}

export async function getProfileStatsController(req, res) {
  try {
    const stats = await getProfileManagementStats();
    return res.status(200).json(stats);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch profile management stats",
    });
  }
}

export async function deleteProfileController(req, res) {
  try {
    const { id } = req.params;
    const result = await deleteProfileById(id);

    if (!result.deleted) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete profile",
    });
  }
}
