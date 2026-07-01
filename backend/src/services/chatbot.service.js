import { db } from "../config/db.js";
import { generateAiText } from "./aiService.js";
import { evaluateEligibility } from "./eligibilityEngine.js";

async function findRelevantSchemes(question) {
  const intents = {
    farmer: ["farmer", "agriculture", "cow", "cattle", "dairy", "acre", "land", "crop", "tractor"],
    student: ["student", "school", "college", "degree", "education", "study", "scholarship"],
    women: ["women", "girl", "mother", "maternity", "widow", "female"],
    startup: ["startup", "business", "entrepreneur", "msme", "company", "loan"],
    disabled: ["disabled", "handicap", "wheelchair", "blind", "deaf"],
    rural: ["rural", "village", "panchayat", "bpl", "ration"],
    housing: ["housing", "home", "house", "shelter"],
    pension: ["pension", "old age", "senior citizen", "retirement"]
  };

  const normalizedQuestion = String(question || "").toLowerCase();
  
  let detectedIntent = null;
  for (const [key, keywords] of Object.entries(intents)) {
    if (keywords.some(kw => normalizedQuestion.includes(kw))) {
      detectedIntent = key;
      break;
    }
  }

  const tokens = String(question || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3)
    .slice(0, 8);

  if (tokens.length === 0 && !detectedIntent) {
    return [];
  }

  const primaryKeyword = detectedIntent || tokens[0];

  const simpleSql = `
    SELECT
      COALESCE(id, scheme_id) AS id,
      COALESCE(name, scheme_name) AS name,
      COALESCE(description, eligibility, '') AS description,
      COALESCE(benefits, '') AS benefits,
      COALESCE(official_link, apply_link, '') AS official_link
    FROM schemes
    WHERE
      LOWER(COALESCE(name, scheme_name, '')) LIKE ?
      OR LOWER(COALESCE(description, eligibility, '')) LIKE ?
      OR LOWER(COALESCE(benefits, '')) LIKE ?
    LIMIT 8
  `;

  try {
    const keywordPattern = `%${primaryKeyword}%`;
    const [rows] = await db.query(simpleSql, [keywordPattern, keywordPattern, keywordPattern]);
    if (rows.length > 0) {
      return rows;
    }
  } catch (error) {
  }

  const whereBlocks = tokens
    .map(
      () =>
        `(LOWER(COALESCE(name, scheme_name, '')) LIKE ? OR LOWER(COALESCE(description, eligibility, '')) LIKE ? OR LOWER(COALESCE(benefits, '')) LIKE ?)`
    )
    .join(" OR ");

  const sql = `
    SELECT
      COALESCE(id, scheme_id) AS id,
      COALESCE(name, scheme_name) AS name,
      COALESCE(description, eligibility, '') AS description,
      COALESCE(benefits, '') AS benefits,
      COALESCE(official_link, apply_link, '') AS official_link
    FROM schemes
    WHERE ${whereBlocks}
    LIMIT 8
  `;

  const params = [];
  for (const token of tokens) {
    const term = `%${token}%`;
    params.push(term, term, term);
  }

  try {
    const [rows] = await db.query(sql, params);
    return rows;
  } catch (error) {
    return [];
  }
}

function formatSchemeContext(schemes) {
  if (!schemes.length) {
    return "No specific scheme matches found in database.";
  }

  return schemes
    .map(
      (scheme, index) =>
        `${index + 1}. ${scheme.name}\nDescription: ${scheme.description}\nBenefits: ${scheme.benefits}\nLink: ${scheme.official_link}`
    )
    .join("\n\n");
}

export async function answerSchemeQuestion({ question, userProfile }) {
  const relevantSchemes = await findRelevantSchemes(question);

  let highlyEligibleSchemes = [];
  try {
    if (userProfile && Object.keys(userProfile).length > 0) {
      const eligibilityResults = await evaluateEligibility(userProfile);
      highlyEligibleSchemes = eligibilityResults
        .filter((r) => ["Eligible", "Possibly Eligible"].includes(r.eligibilityStatus) && r.confidenceScore >= 50)
        .map((r) => ({ name: r.schemeName, description: r.reason }));
    }
  } catch (err) {
    console.error("Eligibility Engine failed during chat RAG:", err.message);
  }

  const eligibleSchemeContext = highlyEligibleSchemes.length > 0
    ? "User is STRICTLY ELIGIBLE for these schemes based on their profile:\n" +
      highlyEligibleSchemes.map((s, i) => `${i + 1}. ${s.name} (Why: ${s.description})`).join("\n")
    : "No strictly evaluated eligibility matches found for this user's profile.";

  const userPrompt = [
    `User Question: "${question}"`,
    "",
    `Known User Profile: ${JSON.stringify(userProfile || {}, null, 2)}`,
    "",
    eligibleSchemeContext,
    "",
    "Relevant Keyword-Matched Schemes from Database:",
    formatSchemeContext(relevantSchemes),
    "",
    "INSTRUCTIONS FOR ANSWERING:",
    "1. Act as a highly empathetic, expert Government Scheme Consultant.",
    "2. Deeply analyze the user's natural language criteria (e.g., '2 cows, 1 acre' implies Marginal/Dairy Farmer).",
    "3. Structure your response beautifully using Markdown bullet points.",
    "4. Explicitly state WHY you are recommending a scheme based on their query or profile.",
    "5. Avoid generic statements. Provide actionable, clear, and direct advice.",
    "6. If they are strictly eligible for something, highlight it as an 'Exact Match'. If they match loosely based on their keywords, list them as 'Potential Matches'.",
    "7. Speak directly to the user (e.g., 'Based on your 1 acre of land...').",
    "8. Always provide simple navigation steps so the user can find these schemes within our platform (e.g., 'To learn more, navigate to the Scheme Explorer from the sidebar and search for the scheme name').",
    "9. If the database context provides an official application link for the scheme, you MUST include it directly in your response as a clickable markdown link."
  ].join("\n");

  const aiAnswer = await generateAiText({
    systemPrompt: "You are an empathetic, highly knowledgeable AI Government Scheme Consultant. You analyze complex user criteria to accurately map them to government schemes. Always use visually clean, structured markdown.",
    userPrompt,
  });

  if (aiAnswer) {
    return {
      answer: aiAnswer,
      source: "ai",
      schemes: relevantSchemes,
    };
  }

  // Improved fallback just in case the LLM completely fails (timeout, quota)
  const fallback = relevantSchemes.length
    ? `**Here are some schemes that might help you:**\n\n${relevantSchemes.map((s) => `- **${s.name}**: ${s.description}`).join("\n")}\n\n*Please ensure your profile is fully filled out for better recommendations.*`
    : "I am having trouble connecting to the system right now to evaluate your specific situation. Please try asking again shortly, or ensure your profile has your precise occupation and state filled out.";

  return {
    answer: fallback,
    source: "fallback",
    schemes: relevantSchemes,
  };
}

export async function explainSchemeForUser({ schemeId, schemeName, userProfile }) {
  let scheme = null;

  try {
    if (schemeId) {
      const [rows] = await db.query(
        `
        SELECT
          COALESCE(id, scheme_id) AS id,
          COALESCE(name, scheme_name) AS name,
          COALESCE(description, eligibility, '') AS description,
          COALESCE(benefits, '') AS benefits,
          COALESCE(official_link, apply_link, '') AS official_link,
          COALESCE(income_limit, income_max) AS income_limit,
          COALESCE(age_min, min_age) AS age_min,
          COALESCE(age_max, max_age) AS age_max,
          COALESCE(gender, gender_allowed) AS gender,
          occupation,
          caste_category,
          state
        FROM schemes
        WHERE COALESCE(id, scheme_id) = ?
        LIMIT 1
        `,
        [schemeId]
      );
      scheme = rows[0] || null;
    } else if (schemeName) {
      const [rows] = await db.query(
        `
        SELECT
          COALESCE(id, scheme_id) AS id,
          COALESCE(name, scheme_name) AS name,
          COALESCE(description, eligibility, '') AS description,
          COALESCE(benefits, '') AS benefits,
          COALESCE(official_link, apply_link, '') AS official_link
        FROM schemes
        WHERE LOWER(COALESCE(name, scheme_name, '')) = LOWER(?)
        LIMIT 1
        `,
        [schemeName]
      );
      scheme = rows[0] || null;
    }
  } catch (error) {
  }

  if (!scheme) {
    return {
      explanation: "Scheme not found.",
      scheme: null,
      source: "fallback",
    };
  }

  const aiExplanation = await generateAiText({
    systemPrompt: "You explain eligibility in simple terms for citizens.",
    userPrompt: [
      `User profile: ${JSON.stringify(userProfile || {}, null, 2)}`,
      `Scheme: ${scheme.name}`,
      `Description: ${scheme.description}`,
      "Explain in 2-3 sentences whether user likely qualifies and why.",
    ].join("\n"),
  });

  if (aiExplanation) {
    return {
      explanation: aiExplanation,
      scheme,
      source: "ai",
    };
  }

  return {
    explanation: `Eligibility for ${scheme.name} depends on your age, income, state, and occupation. Personalized AI reasoning is currently unavailable.`,
    scheme,
    source: "fallback",
  };
}
