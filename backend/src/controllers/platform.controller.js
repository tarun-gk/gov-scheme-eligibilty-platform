import {
  evaluateEligibility,
  getRecommendedSchemes,
  persistEligibilityResults,
} from "../services/eligibilityEngine.js";
import {
  getUserProfileById,
  getProfilesByAccountId,
  saveUserProfile,
} from "../services/userProfile.service.js";
import { answerSchemeQuestion, explainSchemeForUser } from "../services/chatbot.service.js";

function parseNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function normalizeProfile(input = {}) {
  return {
    name: String(input.name || "").trim() || null,
    age: parseNumber(input.age),
    income: parseNumber(input.income),
    gender: input.gender ?? null,
    occupation: String(input.occupation || "").trim() || null,
    caste_category: input.caste_category ?? null,
    state: String(input.state || "").trim() || null,
    land_owned: parseNumber(input.land_owned),
    location_type: input.location_type ?? null,
    disability_status: input.disability_status ?? null,
  };
}

function validateProfileForSave(profile = {}) {
  const missing = [];

  if (!profile.name) missing.push("name");
  if (profile.age === null) missing.push("age");
  if (profile.income === null) missing.push("income");
  if (!profile.state) missing.push("state");
  if (!profile.occupation) missing.push("occupation");

  return missing;
}

export async function saveUserProfileController(req, res) {
  try {
    const profile = normalizeProfile(req.body || {});
    const missingFields = validateProfileForSave(profile);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing mandatory fields: ${missingFields.join(", ")}`,
        success: false,
      });
    }

    const accountId = req.user?.id || null;
    if (!accountId) {
      return res.status(401).json({
        message: "User must be authenticated to save profile",
        success: false,
      });
    }

    const savedProfile = await saveUserProfile(profile, accountId);
    
    return res.status(201).json({
      message: "Profile saved successfully",
      success: true,
      profile: savedProfile,
    });
  } catch (error) {
    console.error("Profile save error:", error.message);
    return res.status(500).json({
      message: "Failed to save user profile",
      success: false,
      error: error.message,
    });
  }
}

export async function getUserProfileController(req, res) {
  try {
    const { id } = req.params;
    const accountId = req.user?.id || null;
    const profile = await getUserProfileById(id, accountId);

    if (!profile) {
      return res.status(404).json({ 
        message: "Profile not found",
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Profile fetch error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch user profile",
      success: false,
      error: error.message,
    });
  }
}

export async function getUserProfilesController(req, res) {
  try {
    const accountId = req.user?.id || null;
    const limit = Number(req.query?.limit || 20);
    const cursor = req.query?.cursor ? Number(req.query.cursor) : null;
    if (!accountId) {
      return res.status(401).json({
        message: "User must be authenticated",
        success: false,
        profiles: [],
      });
    }

    const profiles = await getProfilesByAccountId(accountId, { limit, cursor });
    const nextCursor = profiles.length > 0 ? profiles[profiles.length - 1].id : null;
    return res.status(200).json({
      success: true,
      count: profiles?.length || 0,
      profiles: profiles || [],
      nextCursor,
    });
  } catch (error) {
    console.error("Profiles fetch error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch profiles",
      success: false,
      error: error.message,
      profiles: [],
    });
  }
}

export async function checkEligibilityPlatformController(req, res) {
  try {
    const profile = normalizeProfile(req.body || {});
    const userId = req.body?.userId || null;
    const userProfileId = req.body?.profileId || null;

    const results = await evaluateEligibility(profile);

    const persistResult = await persistEligibilityResults({
      userId,
      userProfileId,
      results,
    });

    return res.status(200).json({
      success: true,
      resultsCount: results.length,
      persistedCount: persistResult.saved,
      failedCount: persistResult.failed,
      results,
    });
  } catch (error) {
    console.error("Eligibility check error:", error.message);
    return res.status(500).json({
      message: "Failed to evaluate eligibility",
      success: false,
      error: error.message,
    });
  }
}

export async function recommendedSchemesController(req, res) {
  try {
    const profile = normalizeProfile(req.query || req.body || {});
    const limit = parseNumber(req.query?.limit) || 10;
    const recommendations = await getRecommendedSchemes(profile, { limit });
    return res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error("Recommendation error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch recommendations",
      success: false,
      error: error.message,
    });
  }
}

export async function chatController(req, res) {
  try {
    const question = req.body?.question;
    const userProfile = normalizeProfile(req.body?.userProfile || {});

    if (!question || String(question).trim() === "") {
      return res.status(400).json({ 
        message: "Question is required",
        success: false,
      });
    }

    const response = await answerSchemeQuestion({ question, userProfile });
    return res.status(200).json({
      success: true,
      response,
    });
  } catch (error) {
    console.error("Chat error:", error.message);
    return res.status(500).json({
      message: "Failed to process chat request",
      success: false,
      error: error.message,
    });
  }
}

export async function explainSchemeController(req, res) {
  try {
    const schemeId = req.body?.schemeId || null;
    const schemeName = req.body?.schemeName || null;
    const userProfile = normalizeProfile(req.body?.userProfile || {});

    if (!schemeId && !schemeName) {
      return res.status(400).json({ 
        message: "schemeId or schemeName is required",
        success: false,
      });
    }

    const explanation = await explainSchemeForUser({ schemeId, schemeName, userProfile });
    return res.status(200).json({
      success: true,
      explanation,
    });
  } catch (error) {
    console.error("Scheme explanation error:", error.message);
    return res.status(500).json({
      message: "Failed to explain scheme",
      success: false,
      error: error.message,
    });
  }
}
