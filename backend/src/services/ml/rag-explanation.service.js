function compactText(text, maxLen = 220) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length > maxLen ? `${clean.slice(0, maxLen)}...` : clean;
}

function buildReasoning(result) {
  if (result.eligibilityStatus === "Eligible") {
    return "The profile satisfies most structured criteria and has strong semantic alignment with the scheme description.";
  }

  if (result.eligibilityStatus === "Possibly Eligible") {
    return "The profile matches core intent signals, but one or more structured criteria need verification before application.";
  }

  return "The profile currently does not satisfy key structured constraints. Future eligibility may improve after profile updates.";
}

export function buildRagExplanation(result) {
  const citations = [
    {
      field: "description",
      snippet: compactText(result.description),
    },
    {
      field: "benefits",
      snippet: compactText(result.benefits),
    },
    {
      field: "documents_required",
      snippet: compactText(result.documents_required),
    },
  ].filter((entry) => entry.snippet.length > 0);

  return {
    summary: buildReasoning(result),
    citations,
  };
}

export function enrichWithRagExplanations(results) {
  return results.map((result) => ({
    ...result,
    explanation: buildRagExplanation(result),
  }));
}
