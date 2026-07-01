import { db } from "../config/db.js";

const MYSCHEME_API = "https://api.myscheme.gov.in/search/v6/schemes";
const API_KEY = "tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc";
const PAGE_SIZE = 25;

function toDeterministicId(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return 700000 + ((hash >>> 0) % 900000000);
}

function limitLength(value, max) {
  if (value == null) return null;
  const str = String(value);
  return str.length > max ? str.slice(0, max) : str;
}

function normalizeScheme(hit) {
  const f = hit?.fields ?? {};
  const slug = f.slug || hit.id || String(Math.random());
  const categories = Array.isArray(f.schemeCategory) ? f.schemeCategory : [];
  const tags = Array.isArray(f.tags) ? f.tags : [];
  const description = f.briefDescription || "Refer official scheme details.";
  const states = Array.isArray(f.beneficiaryState) ? f.beneficiaryState : [];

  return {
    scheme_id: toDeterministicId(String(slug)),
    scheme_name: limitLength(f.schemeName || f.schemeShortTitle || `Scheme ${slug}`, 150),
    department: limitLength(f.nodalMinistryName || categories[0] || "General", 100),
    description,
    status: "ACTIVE",
    state: f.level === "Central" ? "Central" : (states.includes("Telangana") ? "Telangana" : states[0] || "Central"),
    category: limitLength(categories[0] || f.schemeFor || "General", 100),
    eligibility: description,
    benefits: description,
    documents: tags.length > 0 ? tags.join(", ") : null,
    apply_link: `https://www.myscheme.gov.in/schemes/${slug}`,
    min_age: null,
    max_age: null,
    income_max: null,
    gender_allowed: "Any",
    rules_verified: 1,
    rule_source: MYSCHEME_API,
  };
}

// --- Web Import (MyScheme API) ---
export async function importFromWeb(targetCount = 100) {
  const headers = {
    "x-api-key": API_KEY,
    accept: "application/json",
    origin: "https://www.myscheme.gov.in",
    referer: "https://www.myscheme.gov.in/search",
    "user-agent": "Mozilla/5.0",
  };

  const collected = [];
  let offset = 0;

  while (collected.length < targetCount) {
    const url = `${MYSCHEME_API}?lang=en&from=${offset}&size=${PAGE_SIZE}`;
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`API fetch failed: HTTP ${response.status}`);

    const payload = await response.json();
    const items = payload?.data?.hits?.items ?? [];
    if (items.length === 0) break;

    for (const item of items) {
      collected.push(normalizeScheme(item));
      if (collected.length >= targetCount) break;
    }
    offset += PAGE_SIZE;
  }

  return upsertSchemes(collected.slice(0, targetCount));
}

// --- CSV Import ---
export async function importFromCsv(csvText) {
  const lines = csvText.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");

  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
  const schemes = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx]?.trim() || null; });

    schemes.push({
      scheme_id: null,
      scheme_name: limitLength(row.name || row.scheme_name || `Imported Scheme ${i}`, 150),
      department: limitLength(row.department || "General", 100),
      description: row.description || null,
      status: "ACTIVE",
      state: limitLength(row.state || "Central", 100),
      category: limitLength(row.category || "General", 100),
      eligibility: row.eligibility || null,
      benefits: row.benefits || null,
      documents: row.documents || row.documents_required || null,
      apply_link: row.apply_link || row.official_link || null,
      min_age: row.min_age ? Number(row.min_age) : null,
      max_age: row.max_age ? Number(row.max_age) : null,
      income_max: row.income_max || row.income_limit ? Number(row.income_max || row.income_limit) : null,
      gender_allowed: row.gender || row.gender_allowed || "Any",
      rules_verified: 0,
      rule_source: "csv-upload",
    });
  }

  return upsertSchemes(schemes);
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; continue; }
    if (char === "," && !inQuotes) { result.push(current); current = ""; continue; }
    current += char;
  }
  result.push(current);
  return result;
}

// --- Shared upsert ---
async function upsertSchemes(schemes) {
  const sql = `
    INSERT INTO schemes (
      scheme_id, scheme_name, department, description, status, state, category,
      eligibility, benefits, documents, apply_link, min_age, max_age, income_max,
      gender_allowed, rules_verified, rule_source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      scheme_name = VALUES(scheme_name), department = VALUES(department),
      description = VALUES(description), status = VALUES(status),
      state = VALUES(state), category = VALUES(category),
      eligibility = VALUES(eligibility), benefits = VALUES(benefits),
      documents = VALUES(documents), apply_link = VALUES(apply_link),
      min_age = VALUES(min_age), max_age = VALUES(max_age),
      income_max = VALUES(income_max), gender_allowed = VALUES(gender_allowed),
      rules_verified = VALUES(rules_verified), rule_source = VALUES(rule_source)
  `;

  let inserted = 0;
  let updated = 0;

  await db.query("START TRANSACTION");
  try {
    for (const s of schemes) {
      const [result] = await db.execute(sql, [
        s.scheme_id, s.scheme_name, s.department, s.description, s.status, s.state,
        s.category, s.eligibility, s.benefits, s.documents, s.apply_link,
        s.min_age, s.max_age, s.income_max, s.gender_allowed, s.rules_verified, s.rule_source,
      ]);
      if (result.insertId && result.affectedRows === 1) inserted++;
      else updated++;
    }
    await db.query("COMMIT");
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }

  const [[{ total }]] = await db.query("SELECT COUNT(*) as total FROM schemes");
  return { imported: inserted, updated, total: Number(total) };
}
