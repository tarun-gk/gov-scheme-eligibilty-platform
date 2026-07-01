import { evaluateEligibility, getRecommendedSchemes } from "../services/eligibilityEngine.js";

function parseNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function normalizeInputProfile(input = {}) {
  return {
    age: parseNumber(input.age),
    income: parseNumber(input.income),
    gender: input.gender ?? null,
    occupation: input.occupation ?? null,
    caste_category: input.caste_category ?? null,
    state: input.state ?? null,
    land_owned: parseNumber(input.land_owned),
    location_type: input.location_type ?? null,
    disability_status: input.disability_status ?? null,
  };
}

export async function checkEligibility(req, res) {
  try {
    const userProfile = normalizeInputProfile(req.body || {});
    const results = await evaluateEligibility(userProfile);

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to evaluate eligibility",
      error: error.message,
    });
  }
}

export async function recommendedSchemes(req, res) {
  try {
    const userProfile = normalizeInputProfile(req.query || {});
    const results = await getRecommendedSchemes(userProfile);

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch recommended schemes",
      error: error.message,
    });
  }
}
