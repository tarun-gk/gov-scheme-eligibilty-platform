import { getSchemesByIds } from "./scheme.repository.js";

function normalizeDocs(scheme) {
  return String(scheme.documents_required || "")
    .split(/[,;|\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractPrimaryBenefit(text) {
  const source = String(text || "");
  const match = source.match(/(?:₹|rs\.?|inr)\s*([0-9,]+(?:\.[0-9]+)?)(?:\s*(lakh|crore|thousand))?/i);
  if (!match) return null;

  const value = Number(String(match[1]).replace(/,/g, ""));
  if (!Number.isFinite(value)) return null;

  const unit = String(match[2] || "").toLowerCase();
  if (unit === "lakh") return value * 100000;
  if (unit === "crore") return value * 10000000;
  if (unit === "thousand") return value * 1000;
  return value;
}

export async function compareSchemes(ids) {
  const schemes = await getSchemesByIds(ids);

  return schemes.map((scheme) => ({
    id: scheme.id,
    name: scheme.name,
    state: scheme.state,
    ageRange: {
      min: scheme.age_min,
      max: scheme.age_max,
    },
    incomeLimit: scheme.income_limit,
    gender: scheme.gender,
    occupation: scheme.occupation,
    casteCategory: scheme.caste_category,
    documentsRequired: normalizeDocs(scheme),
    primaryBenefitAmount: extractPrimaryBenefit(scheme.benefits),
    benefits: scheme.benefits,
    officialLink: scheme.official_link,
  }));
}
