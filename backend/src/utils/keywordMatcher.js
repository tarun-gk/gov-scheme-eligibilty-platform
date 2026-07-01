function normalize(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim().toLowerCase();
}

const KEYWORD_RULES = [
  { keyword: "farmer", check: (user) => normalize(user?.occupation) === "farmer" },
  { keyword: "small farmer", check: (user) => normalize(user?.occupation) === "farmer" },
  { keyword: "student", check: (user) => normalize(user?.occupation) === "student" },
  { keyword: "women", check: (user) => normalize(user?.gender) === "female" },
  { keyword: "woman", check: (user) => normalize(user?.gender) === "female" },
  { keyword: "entrepreneur", check: (user) => normalize(user?.occupation) === "entrepreneur" },
  { keyword: "startup", check: (user) => ["entrepreneur", "startup founder"].includes(normalize(user?.occupation)) },
  { keyword: "rural", check: (user) => ["rural", "village"].includes(normalize(user?.location_type)) },
  { keyword: "disabled", check: (user) => normalize(user?.disability_status) === "yes" },
  { keyword: "youth", check: (user) => Number(user?.age) >= 18 && Number(user?.age) <= 35 },
  { keyword: "sc", check: (user) => normalize(user?.caste_category) === "sc" },
  { keyword: "st", check: (user) => normalize(user?.caste_category) === "st" },
  { keyword: "obc", check: (user) => normalize(user?.caste_category) === "obc" },
];

export function calculateConfidence(matches) {
  if (matches <= 0) {
    return 0;
  }

  if (matches === 1) {
    return 50;
  }

  if (matches === 2) {
    return 70;
  }

  if (matches === 3) {
    return 80;
  }

  return 90;
}

export function checkKeywordEligibility(user, scheme) {
  const description = normalize(scheme?.description);
  if (!description) {
    return {
      isMatch: false,
      matchCount: 0,
      confidenceScore: 0,
      matchedKeywords: [],
    };
  }

  const matchedKeywords = [];

  for (const rule of KEYWORD_RULES) {
    const hasKeyword = description.includes(rule.keyword);
    if (hasKeyword && rule.check(user)) {
      matchedKeywords.push(rule.keyword);
    }
  }

  const uniqueMatches = [...new Set(matchedKeywords)];
  const matchCount = uniqueMatches.length;

  return {
    isMatch: matchCount > 0,
    matchCount,
    confidenceScore: calculateConfidence(matchCount),
    matchedKeywords: uniqueMatches,
  };
}
