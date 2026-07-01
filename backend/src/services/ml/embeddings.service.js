import { env } from "../../config/env.js";

function buildLocalEmbedding(text, size = 256) {
  const vector = new Array(size).fill(0);
  const tokens = String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  for (const token of tokens) {
    let hash = 0;
    for (let i = 0; i < token.length; i += 1) {
      hash = ((hash << 5) - hash) + token.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % size;
    vector[index] += 1;
  }

  const norm = Math.sqrt(vector.reduce((sum, v) => sum + (v * v), 0)) || 1;
  return vector.map((v) => v / norm);
}

export async function generateEmbedding(text) {
  if (!env.OPENAI_API_KEY) {
    return buildLocalEmbedding(text);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.OPENAI_EMBEDDING_MODEL,
        input: text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Embedding generation failed (${response.status}): ${body}`);
    }

    const payload = await response.json();
    const embedding = payload?.data?.[0]?.embedding;
    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error("Embedding API returned empty vector");
    }

    return embedding;
  } catch {
    return buildLocalEmbedding(text);
  }
}

export function buildSchemeEmbeddingText(scheme) {
  return [
    `Scheme Name: ${scheme.name || ""}`,
    `Description: ${scheme.description || ""}`,
    `Benefits: ${scheme.benefits || ""}`,
    `Required Documents: ${scheme.documents_required || ""}`,
    `State: ${scheme.state || ""}`,
    `Occupation: ${scheme.occupation || ""}`,
    `Caste Category: ${scheme.caste_category || ""}`,
    `Gender: ${scheme.gender || ""}`,
  ].join("\n");
}

export function buildProfileEmbeddingText(profile) {
  return [
    `Age: ${profile.age}`,
    `Income: ${profile.income}`,
    `Gender: ${profile.gender}`,
    `Occupation: ${profile.occupation}`,
    `Caste Category: ${profile.caste_category}`,
    `State: ${profile.state}`,
    `Land Owned: ${profile.land_owned}`,
    `Location Type: ${profile.location_type || ""}`,
    `Disability Status: ${profile.disability_status || ""}`,
    `Documents: ${(profile.documents || []).join(", ")}`,
  ].join("\n");
}
