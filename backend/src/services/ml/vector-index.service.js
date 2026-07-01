import { ensureCollection, searchVectors, upsertVectors } from "../../config/qdrant.js";
import { buildSchemeEmbeddingText, generateEmbedding } from "./embeddings.service.js";

export async function indexSchemes(schemes) {
  if (!Array.isArray(schemes) || schemes.length === 0) return;

  await ensureCollection();

  const points = [];
  for (const scheme of schemes) {
    const embeddingText = buildSchemeEmbeddingText(scheme);
    const vector = await generateEmbedding(embeddingText);

    points.push({
      id: Number(scheme.id),
      vector,
      payload: {
        id: Number(scheme.id),
        state: scheme.state || "Central",
        name: scheme.name,
      },
    });
  }

  await upsertVectors(points);
}

export async function semanticSearch({ vector, state, limit = 40 }) {
  const filter = state
    ? {
        must: [
          {
            key: "state",
            match: { value: state },
          },
        ],
      }
    : null;

  return searchVectors(vector, limit, filter);
}
