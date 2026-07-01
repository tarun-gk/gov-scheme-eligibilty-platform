function normalize(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim().toLowerCase();
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function evaluateLandOwnership(userLandOwned, ruleValue) {
  const normalizedRule = normalize(ruleValue);
  const userLandNumeric = toNumber(userLandOwned);

  if (!normalizedRule) {
    return { passed: true, reason: "No land ownership restriction" };
  }

  const ruleAsNumber = toNumber(ruleValue);
  if (ruleAsNumber !== null) {
    if (userLandNumeric === null) {
      return {
        passed: false,
        reason: `Land ownership must be at least ${ruleAsNumber} acres`,
      };
    }

    return {
      passed: userLandNumeric >= ruleAsNumber,
      reason: `Land ownership must be at least ${ruleAsNumber} acres`,
    };
  }

  if (["required", "yes", "owns land"].includes(normalizedRule)) {
    return {
      passed: userLandNumeric !== null && userLandNumeric > 0,
      reason: "Scheme requires land ownership",
    };
  }

  if (["none", "no", "landless", "no land"].includes(normalizedRule)) {
    return {
      passed: userLandNumeric !== null && userLandNumeric <= 0,
      reason: "Scheme is intended for landless applicants",
    };
  }

  return {
    passed: normalize(userLandOwned) === normalizedRule,
    reason: `Land ownership must match '${ruleValue}'`,
  };
}

export function checkStructuredRules(user, scheme) {
  const hasStructuredRules = [
    scheme?.income_limit,
    scheme?.age_min,
    scheme?.age_max,
    scheme?.occupation,
    scheme?.gender,
    scheme?.state,
    scheme?.caste_category,
    scheme?.land_ownership,
  ].some((value) => value !== null && value !== undefined && String(value).trim() !== "");

  if (!hasStructuredRules) {
    return {
      hasStructuredRules: false,
      isEligible: null,
      failedReasons: [],
    };
  }

  const failedReasons = [];

  const userIncome = toNumber(user?.income);
  const incomeLimit = toNumber(scheme?.income_limit);
  if (incomeLimit !== null && !(userIncome !== null && userIncome <= incomeLimit)) {
    failedReasons.push(`Income must be <= ${incomeLimit}`);
  }

  const userAge = toNumber(user?.age);
  const ageMin = toNumber(scheme?.age_min);
  if (ageMin !== null && !(userAge !== null && userAge >= ageMin)) {
    failedReasons.push(`Age must be >= ${ageMin}`);
  }

  const ageMax = toNumber(scheme?.age_max);
  if (ageMax !== null && !(userAge !== null && userAge <= ageMax)) {
    failedReasons.push(`Age must be <= ${ageMax}`);
  }

  const schemeOccupation = normalize(scheme?.occupation);
  if (schemeOccupation && normalize(user?.occupation) !== schemeOccupation) {
    failedReasons.push(`Occupation must be '${scheme.occupation}'`);
  }

  const schemeGender = normalize(scheme?.gender);
  if (schemeGender && !["any", "all", "both"].includes(schemeGender)) {
    if (normalize(user?.gender) !== schemeGender) {
      failedReasons.push(`Gender must be '${scheme.gender}'`);
    }
  }

  const schemeState = normalize(scheme?.state);
  if (schemeState && normalize(user?.state) !== schemeState) {
    failedReasons.push(`State must be '${scheme.state}'`);
  }

  const schemeCaste = normalize(scheme?.caste_category);
  if (schemeCaste && normalize(user?.caste_category) !== schemeCaste) {
    failedReasons.push(`Caste category must be '${scheme.caste_category}'`);
  }

  if (scheme?.land_ownership !== null && scheme?.land_ownership !== undefined) {
    const landCheck = evaluateLandOwnership(user?.land_owned, scheme.land_ownership);
    if (!landCheck.passed) {
      failedReasons.push(landCheck.reason);
    }
  }

  return {
    hasStructuredRules: true,
    isEligible: failedReasons.length === 0,
    failedReasons,
  };
}
