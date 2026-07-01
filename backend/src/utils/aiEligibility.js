import { generateAiText } from "../services/aiService.js";

export async function explainEligibility(userProfile, scheme) {
  const userPrompt = [
    "You are an eligibility assistant for government schemes.",
    "Explain in 2 short sentences whether the user appears eligible.",
    "Be cautious if data is missing.",
    "",
    "User profile:",
    `Age: ${userProfile?.age ?? "unknown"}`,
    `Occupation: ${userProfile?.occupation ?? "unknown"}`,
    `Income: ${userProfile?.income ?? "unknown"}`,
    `Gender: ${userProfile?.gender ?? "unknown"}`,
    `Caste Category: ${userProfile?.caste_category ?? "unknown"}`,
    `State: ${userProfile?.state ?? "unknown"}`,
    "",
    "Scheme description:",
    scheme?.description || "No description provided.",
  ].join("\n");

  return generateAiText({
    systemPrompt: "Return concise eligibility reasoning only.",
    userPrompt,
  });
}
