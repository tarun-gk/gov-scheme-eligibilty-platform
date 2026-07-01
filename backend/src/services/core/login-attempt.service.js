import { redis } from "../../config/redis.js";

const memoryStore = new Map();
const MAX_ATTEMPTS = 5;
const BASE_LOCK_SECONDS = 60;
const STORE_TTL_SECONDS = 60 * 30;

function keyFor(email, ipAddress) {
  return `auth:login:${String(email || "").trim().toLowerCase()}:${String(ipAddress || "unknown")}`;
}

function readMemory(key) {
  const entry = memoryStore.get(key);
  if (!entry) return null;

  if (entry.expiresAt && entry.expiresAt <= Date.now()) {
    memoryStore.delete(key);
    return null;
  }

  return entry;
}

function writeMemory(key, value, ttlSeconds = STORE_TTL_SECONDS) {
  memoryStore.set(key, {
    ...value,
    expiresAt: Date.now() + (ttlSeconds * 1000),
  });
}

async function readState(key) {
  if (redis) {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  return readMemory(key);
}

async function writeState(key, value, ttlSeconds = STORE_TTL_SECONDS) {
  if (redis) {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    return;
  }

  writeMemory(key, value, ttlSeconds);
}

async function clearState(key) {
  if (redis) {
    await redis.del(key);
    return;
  }

  memoryStore.delete(key);
}

export async function getLoginLock({ email, ipAddress }) {
  const key = keyFor(email, ipAddress);
  const state = await readState(key);
  if (!state) return null;

  if (state.lockUntil && state.lockUntil > Date.now()) {
    return state;
  }

  if (state.lockUntil && state.lockUntil <= Date.now()) {
    await clearState(key);
  }

  return null;
}

export async function recordFailedLogin({ email, ipAddress }) {
  const key = keyFor(email, ipAddress);
  const current = (await readState(key)) || { attempts: 0, lockUntil: null };
  const attempts = current.attempts + 1;
  const overThreshold = attempts >= MAX_ATTEMPTS;
  const backoffMultiplier = Math.max(0, attempts - MAX_ATTEMPTS + 1);
  const lockSeconds = overThreshold ? BASE_LOCK_SECONDS * (2 ** backoffMultiplier) : STORE_TTL_SECONDS;
  const lockUntil = overThreshold ? Date.now() + (lockSeconds * 1000) : null;

  await writeState(key, { attempts, lockUntil }, lockSeconds);

  return {
    attempts,
    lockUntil,
  };
}

export async function clearFailedLogins({ email, ipAddress }) {
  const key = keyFor(email, ipAddress);
  await clearState(key);
}