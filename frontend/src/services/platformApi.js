const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");
const API_V1_BASE = `${API_BASE}/v1`;
let currentAccessToken = null;

export function setAccessToken(token) {
  currentAccessToken = token || null;
}

function authHeaders(extra = {}, token = currentAccessToken) {
  const headers = { "Content-Type": "application/json", ...extra };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/* ── Response helper ──────────────────────────── */
async function safeJson(response, fallbackMessage) {
  if (!response.ok) {
    let message = fallbackMessage;
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || fallbackMessage;
    } catch {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }
    throw new Error(message);
  }

  return response.json();
}

/* ── Auth APIs (public) ───────────────────────── */
export async function apiSignup(name, email, password) {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return safeJson(response, "Signup failed");
}

export async function apiLogin(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return safeJson(response, "Login failed");
}

export async function apiGetMe(token = currentAccessToken) {
  const response = await fetch(`${API_BASE}/auth/me`, {
    credentials: "include",
    headers: { Authorization: `Bearer ${token}` },
  });
  return safeJson(response, "Failed to fetch user info");
}

export async function apiRefreshToken() {
  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  return safeJson(response, "Failed to refresh token");
}

export async function apiLogout() {
  const response = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: authHeaders(),
  });
  return safeJson(response, "Failed to logout");
}

/* ── Schemes (public — no auth) ───────────────── */
export async function fetchSchemes() {
  const response = await fetch(`${API_BASE}/schemes`);
  return safeJson(response, "Failed to fetch schemes");
}

export async function searchSchemes(query) {
  const response = await fetch(`${API_BASE}/schemes/search?q=${encodeURIComponent(query || "")}`);
  return safeJson(response, "Failed to search schemes");
}

export async function fetchSchemeById(id) {
  const response = await fetch(`${API_BASE}/schemes/${id}`);
  if (response.status === 404) {
    return null;
  }
  return safeJson(response, "Failed to fetch scheme details");
}

/* ── Profile (protected) ──────────────────────── */
export async function saveUserProfile(profile) {
  const response = await fetch(`${API_BASE}/user/profile`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(profile),
  });
  return safeJson(response, "Failed to save user profile");
}

export async function fetchUserProfiles() {
  const response = await fetch(`${API_BASE}/user/profile`, {
    headers: authHeaders(),
  });
  return safeJson(response, "Failed to fetch profiles");
}

export async function fetchUserProfileById(profileId) {
  const response = await fetch(`${API_BASE}/user/profile/${profileId}`, {
    headers: authHeaders(),
  });
  if (response.status === 404) {
    return null;
  }
  return safeJson(response, "Failed to fetch user profile");
}

/* ── Eligibility (protected) ──────────────────── */
export async function checkEligibility(payload) {
  const response = await fetch(`${API_V1_BASE}/eligibility/evaluate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ profile: payload, topK: 20, language: "en" }),
  });
  return safeJson(response, "Failed to check eligibility");
}

export async function optimizeBenefits(profile) {
  const response = await fetch(`${API_V1_BASE}/eligibility/optimize`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ profile, topK: 40, language: "en" }),
  });
  return safeJson(response, "Failed to optimize benefits");
}

export async function compareSchemes(ids) {
  const response = await fetch(`${API_V1_BASE}/schemes/compare?ids=${encodeURIComponent(ids.join(","))}`, {
    headers: authHeaders(),
  });
  return safeJson(response, "Failed to compare schemes");
}

export async function postInteractionEvent(payload) {
  const response = await fetch(`${API_V1_BASE}/interactions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return safeJson(response, "Failed to post interaction");
}

export async function fetchAnalyticsSummary(state) {
  const query = state ? `?state=${encodeURIComponent(state)}` : "";
  const response = await fetch(`${API_V1_BASE}/analytics/summary${query}`, {
    headers: authHeaders(),
  });
  return safeJson(response, "Failed to fetch analytics summary");
}

/* ── Recommendations (protected) ──────────────── */
export async function getRecommendedSchemes(profile, limit = 10) {
  const params = new URLSearchParams({
    age: profile?.age ?? "",
    income: profile?.income ?? "",
    gender: profile?.gender ?? "",
    occupation: profile?.occupation ?? "",
    caste_category: profile?.caste_category ?? "",
    state: profile?.state ?? "",
    land_owned: profile?.land_owned ?? "",
    limit: String(limit),
  });

  const response = await fetch(`${API_BASE}/recommended-schemes?${params.toString()}`, {
    headers: authHeaders(),
  });
  return safeJson(response, "Failed to fetch recommendations");
}

/* ── Chat (protected) ─────────────────────────── */
export async function askChatbot(question, userProfile) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ question, userProfile }),
  });
  return safeJson(response, "Failed to get chatbot response");
}

/* ── Scheme explanation (protected) ───────────── */
export async function explainScheme(schemeId, userProfile) {
  const response = await fetch(`${API_BASE}/explain-scheme`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ schemeId, userProfile }),
  });
  return safeJson(response, "Failed to explain scheme");
}

/* ── Admin (JWT admin or legacy key) ──────────── */
function buildAdminHeaders(adminKey) {
  const headers = authHeaders();
  if (adminKey) {
    headers["x-admin-key"] = adminKey;
  }
  return headers;
}

export async function fetchAdminProfileStats(adminKey) {
  const response = await fetch(`${API_BASE}/admin/profiles/stats`, {
    headers: buildAdminHeaders(adminKey),
  });
  return safeJson(response, "Failed to fetch admin profile stats");
}

export async function fetchAdminProfiles(adminKey, { limit = 50, offset = 0 } = {}) {
  const response = await fetch(
    `${API_BASE}/admin/profiles?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`,
    {
      headers: buildAdminHeaders(adminKey),
    }
  );
  return safeJson(response, "Failed to fetch admin profiles");
}

export async function deleteAdminProfile(adminKey, profileId) {
  const response = await fetch(`${API_BASE}/admin/profiles/${profileId}`, {
    method: "DELETE",
    headers: buildAdminHeaders(adminKey),
  });
  return safeJson(response, "Failed to delete profile");
}
