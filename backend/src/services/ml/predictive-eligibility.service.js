function monthsUntilAgeEligibility(profileAge, ageMin) {
  if (ageMin === null || ageMin === undefined) return 0;
  if (profileAge >= ageMin) return 0;
  return (ageMin - profileAge) * 12;
}

function monthsUntilIncomeEligibility(profileIncome, incomeLimit) {
  if (incomeLimit === null || incomeLimit === undefined) return 0;
  if (profileIncome <= incomeLimit) return 0;

  const annualReductionRate = 0.08;
  let income = profileIncome;
  let months = 0;

  while (income > incomeLimit && months <= 120) {
    income = income * (1 - annualReductionRate / 12);
    months += 1;
  }

  return months;
}

export function predictEligibilityTimeline(profile, scheme, readinessScore) {
  const byAge = monthsUntilAgeEligibility(Number(profile.age || 0), scheme.age_min ?? null);
  const byIncome = monthsUntilIncomeEligibility(Number(profile.income || 0), scheme.income_limit ?? null);

  const docPenalty = readinessScore >= 80 ? 0 : readinessScore >= 50 ? 1 : 3;
  const months = Math.max(byAge, byIncome) + docPenalty;

  return {
    predictedEligibleInMonths: months,
    blockers: {
      age: byAge,
      income: byIncome,
      documents: docPenalty,
    },
  };
}
