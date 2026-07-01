import crypto from "crypto";
import { redis } from "../../config/redis.js";
import { env } from "../../config/env.js";
import { checkStructuredRules } from "../../utils/ruleMatcher.js";
import { computeDocumentReadiness } from "../core/document-readiness.service.js";
import { getHistoricalSignal } from "../core/historical-signal.service.js";
import { listSchemes, getSchemeVersionToken, getSchemesByIds } from "../core/scheme.repository.js";
import { buildProfileEmbeddingText, generateEmbedding } from "./embeddings.service.js";
import { buildSchemeEmbeddingText } from "./embeddings.service.js";
import { semanticSearch } from "./vector-index.service.js";
import { predictEligibilityTimeline } from "./predictive-eligibility.service.js";
import { buildRecommendationTrace, validateSchemeRecord } from "../core/data-integrity.service.js";
import { enrichWithRagExplanations } from "./rag-explanation.service.js";

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function profileHash(profile) {
  return crypto.createHash("sha256").update(JSON.stringify(profile)).digest("hex");
}

function semanticScore(hit) {
  return Math.round(Math.max(0, Math.min(100, (hit.score || 0) * 100)));
}

function cosineSimilarity(a = [], b = []) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) {
    return 0;
  }

  const len = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < len; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }

  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom > 0 ? dot / denom : 0;
}

function ruleScore(structuredResult) {
  if (!structuredResult.hasStructuredRules) return 50;
  if (structuredResult.isEligible) return 100;
  return Math.max(0, 70 - (structuredResult.failedReasons.length * 20));
}

function buildStatus(score) {
  if (score >= 75) return "Eligible";
  if (score >= 45) return "Possibly Eligible";
  return "Not Eligible";
}

export async function evaluateHybridEligibility({ profile, accountId = null, topK = 20 }) {
  const version = await getSchemeVersionToken();
  const cacheKey = `eligibility:${profileHash(profile)}:${version}:${topK}`;

  try {
    const cached = redis ? await redis.get(cacheKey) : null;
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
  }

  const profileVector = await generateEmbedding(buildProfileEmbeddingText(profile));

  const phase1 = await listSchemes({ state: profile.state || null, limit: 600 });
  const phase1Prefilter = phase1.filter((scheme) => {
    const gender = String(scheme.gender || "Any").toLowerCase();
    const genderMatches = gender === "any" || gender === String(profile.gender || "").toLowerCase();
    const stateMatches = !scheme.state || !profile.state || String(scheme.state).toLowerCase() === String(profile.state).toLowerCase();
    return genderMatches && stateMatches;
  });

  let semanticHits;
  try {
    semanticHits = await semanticSearch({
      vector: profileVector,
      state: profile.state || null,
      limit: Math.max(topK * 3, 50),
    });
  } catch {
    semanticHits = [];
    for (const scheme of phase1Prefilter) {
      const schemeVector = await generateEmbedding(buildSchemeEmbeddingText(scheme));
      semanticHits.push({
        id: Number(scheme.id),
        score: cosineSimilarity(profileVector, schemeVector),
      });
    }

    semanticHits.sort((a, b) => (b.score || 0) - (a.score || 0));
    semanticHits = semanticHits.slice(0, Math.max(topK * 3, 50));
  }

  const semanticIds = Array.from(new Set(semanticHits.map((hit) => Number(hit.id)).filter((id) => Number.isFinite(id))));
  const phase2Schemes = await getSchemesByIds(semanticIds);
  const schemeMap = new Map(phase2Schemes.map((scheme) => [Number(scheme.id), scheme]));
  const hitMap = new Map(semanticHits.map((hit) => [Number(hit.id), hit]));

  const historicalSignal = await getHistoricalSignal({
    accountId,
    schemeIds: semanticIds,
  });

  const scored = [];

  for (const scheme of phase1Prefilter) {
    if (!schemeMap.has(Number(scheme.id))) continue;

    const structured = checkStructuredRules(profile, scheme);
    const readiness = computeDocumentReadiness(profile.documents || [], scheme);
    const prediction = predictEligibilityTimeline(profile, scheme, readiness.readinessScore);

    const hit = hitMap.get(Number(scheme.id));
    const sem = semanticScore(hit || { score: 0 });
    const rule = ruleScore(structured);
    const readinessScore = readiness.readinessScore;
    const historical = historicalSignal.get(Number(scheme.id)) || 0;

    const finalScore = Math.round((sem * 0.45) + (rule * 0.35) + (readinessScore * 0.10) + (historical * 0.10));
    const status = buildStatus(finalScore);
    const integrity = validateSchemeRecord(scheme);

    if (!integrity.isValid) {
      continue;
    }

    const scoreBreakdown = {
      semantic: sem,
      rule,
      readiness: readinessScore,
      historical,
      final: finalScore,
    };

    scored.push({
      id: scheme.id,
      name: scheme.name,
      description: scheme.description,
      benefits: scheme.benefits,
      documents_required: scheme.documents_required,
      official_link: scheme.official_link,
      state: scheme.state,
      gender: scheme.gender,
      income_limit: scheme.income_limit,
      age_min: scheme.age_min,
      age_max: scheme.age_max,
      eligibilityStatus: status,
      finalScore,
      signals: {
        semantic: sem,
        rule,
        readiness: readinessScore,
        historical,
      },
      readiness,
      prediction,
      ruleFailures: structured.failedReasons,
      verificationStatus: integrity.verificationStatus,
      trace: buildRecommendationTrace({
        scheme,
        scoreBreakdown,
        integrity,
      }),
    });
  }

  scored.sort((a, b) => b.finalScore - a.finalScore);
  const result = enrichWithRagExplanations(scored.slice(0, topK));

  try {
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(result), "EX", env.CACHE_TTL_SECONDS);
    }
  } catch {
  }
  return result;
}
