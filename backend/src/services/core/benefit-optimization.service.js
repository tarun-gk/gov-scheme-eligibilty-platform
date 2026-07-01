function extractNumericAmounts(text) {
  if (!text) return [];

  const source = String(text).replace(/,/g, "");
  const matches = [];

  const rupeeMatches = source.matchAll(/(?:rs\.?|inr|₹)\s*(\d+(?:\.\d+)?)(?:\s*(lakh|crore|thousand))?/gi);
  for (const match of rupeeMatches) {
    const value = Number(match[1]);
    const unit = (match[2] || "").toLowerCase();
    if (!Number.isFinite(value)) continue;
    if (unit === "lakh") matches.push(value * 100000);
    else if (unit === "crore") matches.push(value * 10000000);
    else if (unit === "thousand") matches.push(value * 1000);
    else matches.push(value);
  }

  if (matches.length > 0) return matches;

  const plainMatches = source.matchAll(/\b(\d{4,})\b/g);
  for (const match of plainMatches) {
    const value = Number(match[1]);
    if (Number.isFinite(value)) matches.push(value);
  }

  return matches;
}

function estimateSchemeBenefit(scheme) {
  const amounts = [
    ...extractNumericAmounts(scheme.benefits),
    ...extractNumericAmounts(scheme.description),
  ];

  if (amounts.length === 0) {
    return 0;
  }

  return Math.max(...amounts);
}

function hasPotentialConflict(existing, candidate) {
  const existingText = `${existing.name} ${existing.description} ${existing.benefits}`.toLowerCase();
  const candidateText = `${candidate.name} ${candidate.description} ${candidate.benefits}`.toLowerCase();

  const conflictKeywords = ["exclusive", "cannot be combined", "one scheme only", "not applicable with"];
  const existingHasConflict = conflictKeywords.some((k) => existingText.includes(k));
  const candidateHasConflict = conflictKeywords.some((k) => candidateText.includes(k));

  return existingHasConflict || candidateHasConflict;
}

export function optimizeBenefitStack(scoredSchemes, maxSchemes = 5) {
  const eligible = scoredSchemes
    .filter((item) => item.eligibilityStatus === "Eligible" || item.eligibilityStatus === "Possibly Eligible")
    .map((item) => ({
      ...item,
      estimatedBenefit: estimateSchemeBenefit(item),
    }))
    .sort((a, b) => (b.estimatedBenefit + b.finalScore) - (a.estimatedBenefit + a.finalScore));

  const selected = [];

  for (const candidate of eligible) {
    if (selected.length >= maxSchemes) break;
    if (selected.some((current) => hasPotentialConflict(current, candidate))) continue;
    selected.push(candidate);
  }

  return {
    selectedSchemes: selected,
    totalEstimatedBenefit: selected.reduce((sum, item) => sum + item.estimatedBenefit, 0),
    totalSchemesConsidered: eligible.length,
  };
}
