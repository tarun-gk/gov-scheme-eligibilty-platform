import { db } from "../config/db.js";
import { schemesFallback } from "../data/schemes.fallback.js";
import { checkStructuredRules } from "../utils/ruleMatcher.js";
import { checkKeywordEligibility } from "../utils/keywordMatcher.js";
import { explainEligibility } from "../utils/aiEligibility.js";
import { rankSchemesByRelevance } from "./recommendationEngine.js";

function mapLegacySchemeToEligibility(legacyScheme) {
  return {
    id: legacyScheme.scheme_id,
    name: legacyScheme.scheme_name,
    description: legacyScheme.eligibility,
    income_limit: legacyScheme.income_max,
    age_min: legacyScheme.min_age,
    age_max: legacyScheme.max_age,
    gender: legacyScheme.gender_allowed,
    occupation: null,
    caste_category: null,
    state: legacyScheme.state,
    land_ownership: null,
    benefits: legacyScheme.benefits,
    documents_required: legacyScheme.documents,
    official_link: legacyScheme.apply_link,
  };
}

async function fetchSchemesForEligibility() {
  const newSchemaQuery = `
    SELECT
      COALESCE(id, scheme_id) AS id,
      COALESCE(name, scheme_name) AS name,
      COALESCE(description, eligibility) AS description,
      income_limit,
      age_min,
      age_max,
      COALESCE(gender, gender_allowed) AS gender,
      occupation,
      caste_category,
      state,
      land_ownership,
      COALESCE(benefits, description) AS benefits,
      COALESCE(documents_required, documents) AS documents_required,
      COALESCE(official_link, apply_link) AS official_link
    FROM schemes
    ORDER BY COALESCE(id, scheme_id)
  `;

  const legacySchemaQuery = `
    SELECT
      scheme_id AS id,
      scheme_name AS name,
      eligibility AS description,
      income_max AS income_limit,
      min_age AS age_min,
      max_age AS age_max,
      gender_allowed AS gender,
      NULL AS occupation,
      NULL AS caste_category,
      state,
      NULL AS land_ownership,
      benefits,
      documents AS documents_required,
      apply_link AS official_link
    FROM schemes
    ORDER BY scheme_id
  `;

  try {
    const [rows] = await db.query(newSchemaQuery);
    if (rows.length > 0) {
      return rows;
    }
  } catch {
  }

  try {
    const [rows] = await db.query(legacySchemaQuery);
    if (rows.length > 0) {
      return rows;
    }
  } catch {
  }

  return schemesFallback.map(mapLegacySchemeToEligibility);
}

function getConfidenceLabel(score) {
  if (score >= 85) {
    return "High";
  }

  if (score >= 60) {
    return "Medium";
  }

  if (score > 0) {
    return "Low";
  }

  return "None";
}

function generateEligibilityResult({ scheme, status, score, reason, tags = [], aiReason = null }) {
  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    eligibilityStatus: status,
    confidenceScore: score,
    confidenceMeter: getConfidenceLabel(score),
    eligibilityTags: tags,
    reason,
    eligibilityReason: aiReason,
    officialLink: scheme.official_link || null,
  };
}

function normalizeUserProfile(input) {
  return {
    age: input?.age ?? null,
    income: input?.income ?? null,
    gender: input?.gender ?? null,
    occupation: input?.occupation ?? null,
    caste_category: input?.caste_category ?? null,
    state: input?.state ?? null,
    land_owned: input?.land_owned ?? null,
    location_type: input?.location_type ?? null,
    disability_status: input?.disability_status ?? null,
  };
}

function getStructuredConfidence(structuredResult) {
  if (structuredResult.isEligible) {
    return 100;
  }

  const failureCount = Array.isArray(structuredResult.failedReasons)
    ? structuredResult.failedReasons.length
    : 1;

  if (failureCount <= 1) {
    return 40;
  }

  if (failureCount === 2) {
    return 25;
  }

  return 10;
}

export async function evaluateEligibility(userProfileInput) {
  const userProfile = normalizeUserProfile(userProfileInput);
  const schemes = await fetchSchemesForEligibility();

  const results = [];
  for (const scheme of schemes) {
    const structuredResult = checkStructuredRules(userProfile, scheme);

    if (structuredResult.hasStructuredRules) {
      const status = structuredResult.isEligible ? "Eligible" : "Not Eligible";
      const reason = structuredResult.isEligible
        ? "All available structured rules matched"
        : structuredResult.failedReasons.join("; ");

      results.push(
        generateEligibilityResult({
          scheme,
          status,
          score: getStructuredConfidence(structuredResult),
          reason,
          tags: ["structured-rules"],
        })
      );
      continue;
    }

    const keywordResult = checkKeywordEligibility(userProfile, scheme);
    if (keywordResult.isMatch) {
      const aiReason = await explainEligibility(userProfile, scheme);

      results.push(
        generateEligibilityResult({
          scheme,
          status: "Possibly Eligible",
          score: keywordResult.confidenceScore,
          reason: `Matched keywords: ${keywordResult.matchedKeywords.join(", ")}`,
          tags: ["keyword-match", ...keywordResult.matchedKeywords],
          aiReason,
        })
      );
      continue;
    }

    const aiReason = await explainEligibility(userProfile, scheme);

    if (aiReason) {
      results.push(
        generateEligibilityResult({
          scheme,
          status: "Possibly Eligible",
          score: 50,
          reason: "AI inferred possible eligibility due to unstructured scheme information",
          tags: ["ai-inference"],
          aiReason,
        })
      );
      continue;
    }

    results.push(
      generateEligibilityResult({
        scheme,
        status: "Unknown",
        score: 0,
        reason: "No structured rules or relevant keyword match available",
        tags: ["insufficient-data"],
        aiReason,
      })
    );
  }

  return results;
}

export async function persistEligibilityResults({ userId = null, userProfileId = null, results = [] }) {
  if (!Array.isArray(results) || results.length === 0) {
    return { saved: 0, failed: 0 };
  }

  const query = `
    INSERT INTO eligibility_results
      (user_id, user_profile_id, scheme_id, eligibility_status, confidence_score, reason, ai_explanation)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  let savedCount = 0;
  let failedCount = 0;

  for (const result of results) {
    try {
      await db.query(query, [
        userId,
        userProfileId,
        result.schemeId || null,
        result.eligibilityStatus,
        result.confidenceScore,
        result.reason,
        result.eligibilityReason,
      ]);
      savedCount++;
    } catch (error) {
      failedCount++;
      console.error(
        `Failed to save eligibility result for scheme ${result.schemeId}:`,
        error.message
      );
    }
  }

  return { saved: savedCount, failed: failedCount };
}

export async function getRecommendedSchemes(userProfileInput, { limit = 10 } = {}) {
  const eligibilityResults = await evaluateEligibility(userProfileInput);

  const candidates = eligibilityResults
    .filter((result) => ["Eligible", "Possibly Eligible"].includes(result.eligibilityStatus))
    .sort((a, b) => b.confidenceScore - a.confidenceScore);

  return rankSchemesByRelevance(candidates, userProfileInput).slice(0, limit);
}
