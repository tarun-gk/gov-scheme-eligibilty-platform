function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

export function rankSchemesByRelevance(results, userProfile) {
  return [...results]
    .map((result) => {
      let boost = 0;
      const reason = normalize(result.reason);

      if (result.eligibilityStatus === "Eligible") {
        boost += 20;
      }

      if (normalize(userProfile?.occupation) && reason.includes(normalize(userProfile.occupation))) {
        boost += 10;
      }

      if (normalize(userProfile?.state) && reason.includes(normalize(userProfile.state))) {
        boost += 10;
      }

      return {
        ...result,
        recommendationScore: Math.min(100, result.confidenceScore + boost),
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore);
}
