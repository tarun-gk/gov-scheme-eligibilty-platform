import test from "node:test";
import assert from "node:assert/strict";
import { parseEnv } from "../src/config/env.js";

test("parseEnv allows optional Redis, Qdrant, and OpenAI settings to be omitted", () => {
  const env = parseEnv({
    NODE_ENV: "development",
    PORT: "5000",
    DB_HOST: "localhost",
    DB_USER: "root",
    DB_PASSWORD: "password",
    DB_NAME: "gov_scheme_eligibility",
    DB_PORT: "3306",
    JWT_ACCESS_SECRET: "a".repeat(32),
    JWT_REFRESH_SECRET: "b".repeat(32),
    JWT_ACCESS_TTL: "15m",
    JWT_REFRESH_TTL_DAYS: "30",
    QDRANT_COLLECTION: "scheme_embeddings",
    FRONTEND_ORIGIN: "http://localhost:5173",
    OPENAI_EMBEDDING_MODEL: "text-embedding-3-small",
    OPENAI_CHAT_MODEL: "gpt-4o-mini",
    API_RATE_LIMIT_WINDOW_MS: "60000",
    API_RATE_LIMIT_MAX_IP: "120",
    API_RATE_LIMIT_MAX_USER: "300",
    CACHE_TTL_SECONDS: "600",
  });

  assert.equal(env.REDIS_URL, undefined);
  assert.equal(env.QDRANT_URL, undefined);
  assert.equal(env.OPENAI_API_KEY, undefined);
});

test("parseEnv treats empty optional service values as omitted", () => {
  const env = parseEnv({
    NODE_ENV: "development",
    PORT: "5000",
    DB_HOST: "localhost",
    DB_USER: "root",
    DB_PASSWORD: "password",
    DB_NAME: "gov_scheme_eligibility",
    DB_PORT: "3306",
    JWT_ACCESS_SECRET: "a".repeat(32),
    JWT_REFRESH_SECRET: "b".repeat(32),
    REDIS_URL: "",
    QDRANT_URL: "",
    OPENAI_API_KEY: "",
  });

  assert.equal(env.REDIS_URL, undefined);
  assert.equal(env.QDRANT_URL, undefined);
  assert.equal(env.OPENAI_API_KEY, undefined);
});