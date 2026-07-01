function isNonEmpty(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

export function validateSchemeRecord(scheme) {
  const issues = [];

  if (!isNonEmpty(scheme.name)) issues.push("Missing scheme name");
  if (!isNonEmpty(scheme.description)) issues.push("Missing scheme description");
  if (!isNonEmpty(scheme.state)) issues.push("Missing state");

  const verifiedFields = {
    income_limit: isNonEmpty(scheme.income_limit),
    age_min: isNonEmpty(scheme.age_min),
    age_max: isNonEmpty(scheme.age_max),
    gender: isNonEmpty(scheme.gender),
    occupation: isNonEmpty(scheme.occupation),
    caste_category: isNonEmpty(scheme.caste_category),
    documents_required: isNonEmpty(scheme.documents_required),
  };

  const verifiedFieldCount = Object.values(verifiedFields).filter(Boolean).length;
  const verificationStatus = verifiedFieldCount >= 4 ? "verified" : "partially_verified";

  return {
    isValid: issues.length === 0,
    issues,
    verificationStatus,
    verifiedFields,
    verifiedFieldCount,
  };
}

export function buildRecommendationTrace({ scheme, scoreBreakdown, integrity }) {
  return {
    schemeId: scheme.id,
    source: {
      table: "schemes",
      recordId: scheme.id,
      updatedAt: scheme.updated_at || null,
    },
    scoring: scoreBreakdown,
    integrity,
  };
}
