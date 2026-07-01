import { env } from "./env.js";

const headers = {
  "Content-Type": "application/json",
};

if (env.QDRANT_API_KEY) {
  headers["api-key"] = env.QDRANT_API_KEY;
}

async function qdrantRequest(path, options = {}) {
  if (!env.QDRANT_URL) {
    return null;
  }

  const response = await fetch(`${env.QDRANT_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Qdrant request failed (${response.status}): ${body}`);
  }

  return response.json();
}

export async function ensureCollection(vectorSize = 1536) {
  if (!env.QDRANT_URL) {
    return;
  }

  try {
    await qdrantRequest(`/collections/${env.QDRANT_COLLECTION}`);
    return;
  } catch {
  }

  await qdrantRequest(`/collections/${env.QDRANT_COLLECTION}`, {
    method: "PUT",
    body: JSON.stringify({
      vectors: {
        size: vectorSize,
        distance: "Cosine",
      },
    }),
  });
}

export async function upsertVectors(points) {
  if (!Array.isArray(points) || points.length === 0) return;
  if (!env.QDRANT_URL) return;

  await qdrantRequest(`/collections/${env.QDRANT_COLLECTION}/points`, {
    method: "PUT",
    body: JSON.stringify({ points }),
  });
}

export async function searchVectors(vector, limit = 30, filter = null) {
  if (!env.QDRANT_URL) {
    return [];
  }

  const body = { vector, limit };
  if (filter) body.filter = filter;

  const result = await qdrantRequest(`/collections/${env.QDRANT_COLLECTION}/points/search`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  return result?.result || [];
}
