import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

dotenv.config({ path: path.join(projectRoot, "backend", ".env") });

const API_URL = "https://api.myscheme.gov.in/search/v6/schemes";
const API_KEY = "tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc";
const TARGET_COUNT = 100;
const PAGE_SIZE = 25;

function limitLength(value, maxLength) {
  if (value == null) return value;
  const text = String(value);
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function toDeterministicId(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const positive = hash >>> 0;
  return 700000 + (positive % 900000000);
}

function pickState(level, beneficiaryState) {
  if (level === "Central") return "Central";
  const states = Array.isArray(beneficiaryState) ? beneficiaryState : [];
  return states.includes("Telangana") ? "Telangana" : "Central";
}

function normalizeScheme(hit) {
  const fields = hit?.fields ?? {};
  const slug = fields.slug || hit.id;
  const categories = Array.isArray(fields.schemeCategory) ? fields.schemeCategory : [];
  const tags = Array.isArray(fields.tags) ? fields.tags : [];
  const description = fields.briefDescription || "Refer official scheme details.";

  return {
    scheme_id: toDeterministicId(String(slug)),
    scheme_name: limitLength(
      fields.schemeName || fields.schemeShortTitle || `Scheme ${slug}`,
      150,
    ),
    department: limitLength(fields.nodalMinistryName || categories[0] || "General", 100),
    description,
    status: "ACTIVE",
    state: pickState(fields.level, fields.beneficiaryState),
    category: limitLength(categories[0] || fields.schemeFor || "General", 100),
    eligibility: description,
    benefits: description,
    documents: tags.length > 0 ? tags.join(", ") : null,
    apply_link: `https://www.myscheme.gov.in/schemes/${slug}`,
    min_age: null,
    max_age: null,
    income_max: null,
    gender_allowed: "Any",
    rules_verified: 1,
    rule_source: API_URL,
  };
}

async function fetchSchemesFromWeb(limit) {
  const headers = {
    "x-api-key": API_KEY,
    accept: "application/json",
    origin: "https://www.myscheme.gov.in",
    referer: "https://www.myscheme.gov.in/search",
    "user-agent": "Mozilla/5.0",
  };

  const collected = [];
  let offset = 0;

  while (collected.length < limit) {
    const url = `${API_URL}?lang=en&from=${offset}&size=${PAGE_SIZE}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Web fetch failed (${response.status}) for offset ${offset}`);
    }

    const payload = await response.json();
    const items = payload?.data?.hits?.items ?? [];
    if (items.length === 0) {
      break;
    }

    for (const item of items) {
      collected.push(normalizeScheme(item));
      if (collected.length >= limit) {
        break;
      }
    }

    offset += PAGE_SIZE;
  }

  return collected.slice(0, limit);
}

async function upsertSchemes(schemes) {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
  });

  const sql = `
    INSERT INTO schemes (
      scheme_id,
      scheme_name,
      department,
      description,
      status,
      state,
      category,
      eligibility,
      benefits,
      documents,
      apply_link,
      min_age,
      max_age,
      income_max,
      gender_allowed,
      rules_verified,
      rule_source
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      scheme_name = VALUES(scheme_name),
      department = VALUES(department),
      description = VALUES(description),
      status = VALUES(status),
      state = VALUES(state),
      category = VALUES(category),
      eligibility = VALUES(eligibility),
      benefits = VALUES(benefits),
      documents = VALUES(documents),
      apply_link = VALUES(apply_link),
      min_age = VALUES(min_age),
      max_age = VALUES(max_age),
      income_max = VALUES(income_max),
      gender_allowed = VALUES(gender_allowed),
      rules_verified = VALUES(rules_verified),
      rule_source = VALUES(rule_source)
  `;

  try {
    await conn.beginTransaction();

    for (const scheme of schemes) {
      await conn.execute(sql, [
        scheme.scheme_id,
        scheme.scheme_name,
        scheme.department,
        scheme.description,
        scheme.status,
        scheme.state,
        scheme.category,
        scheme.eligibility,
        scheme.benefits,
        scheme.documents,
        scheme.apply_link,
        scheme.min_age,
        scheme.max_age,
        scheme.income_max,
        scheme.gender_allowed,
        scheme.rules_verified,
        scheme.rule_source,
      ]);
    }

    const [rows] = await conn.query("SELECT COUNT(*) AS total FROM schemes");
    await conn.commit();
    return rows[0]?.total ?? 0;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    await conn.end();
  }
}

async function main() {
  const schemes = await fetchSchemesFromWeb(TARGET_COUNT);
  if (schemes.length === 0) {
    throw new Error("No schemes fetched from web source");
  }

  const dbTotal = await upsertSchemes(schemes);
  console.log(`Imported/updated ${schemes.length} web schemes. DB total now: ${dbTotal}`);
}

main().catch((error) => {
  console.error("Web import failed:", error.message);
  process.exit(1);
});
