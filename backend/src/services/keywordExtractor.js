import { generateAiText } from "./aiService.js";

const BASE_KEYWORDS = [
  "farmer",
  "student",
  "women",
  "startup",
  "entrepreneur",
  "disabled",
  "rural",
  "youth",
  "sc",
  "st",
  "obc",
  "scholarship",
  "housing",
  "pension",
];

function normalizeText(value) {
  if (!value) return "";
  return String(value).toLowerCase();
}

export function extractKeywordsLocal(text = "") {
  const normalized = normalizeText(text);
  return BASE_KEYWORDS.filter((keyword) => normalized.includes(keyword));
}

export async function enrichSchemeUnderstanding(scheme) {
  const description = scheme?.description || "";
  const localKeywords = extractKeywordsLocal(description);

  const aiResponse = await generateAiText({
    systemPrompt:
      "You extract scheme metadata. Return strict JSON with keys: targetAudience, keywords, benefitsSummary, eligibilityHints.",
    userPrompt: `Scheme name: ${scheme?.name || "Unknown"}\nDescription: ${description}`,
  });

  if (!aiResponse) {
    return {
      targetAudience: null,
      keywords: localKeywords,
      benefitsSummary: scheme?.benefits || null,
      eligibilityHints: null,
      source: "local",
    };
  }

  try {
    const parsed = JSON.parse(aiResponse);
    return {
      targetAudience: parsed?.targetAudience || null,
      keywords: Array.isArray(parsed?.keywords) && parsed.keywords.length > 0 ? parsed.keywords : localKeywords,
      benefitsSummary: parsed?.benefitsSummary || scheme?.benefits || null,
      eligibilityHints: parsed?.eligibilityHints || null,
      source: "ai",
    };
  } catch (error) {
    return {
      targetAudience: null,
      keywords: localKeywords,
      benefitsSummary: scheme?.benefits || null,
      eligibilityHints: null,
      source: "local",
    };
  }
}
