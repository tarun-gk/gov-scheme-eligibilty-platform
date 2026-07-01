import { env } from "../config/env.js";

const DEFAULT_TIMEOUT_MS = 25000;

async function requestWithTimeout(url, options, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function callOpenAI(messages) {
  if (!env.OPENAI_API_KEY) {
    return null;
  }

  const baseUrl = "https://api.openai.com/v1";
  const model = env.OPENAI_CHAT_MODEL;

  const response = await requestWithTimeout(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages,
    }),
  });

  if (!response.ok) return null;
  const payload = await response.json();
  return payload?.choices?.[0]?.message?.content?.trim() || null;
}

export async function generateAiText({ systemPrompt, userPrompt }) {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  try {
    const result = await callOpenAI(messages);
    if (result) return result;
  } catch (error) {
    console.error("AI generation failed:", error?.message);
  }

  return null;
}

export function aiStatus() {
  return {
    enabled: Boolean(env.OPENAI_API_KEY),
    provider: env.OPENAI_API_KEY ? "openai" : "local-fallback",
  };
}
