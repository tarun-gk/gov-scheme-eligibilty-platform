import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

dotenv.config({ path: path.join(projectRoot, "backend", ".env") });

const csvPath = path.join(projectRoot, "database", "dataset", "schemes_dataset_v2.csv");

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function toNullableInt(value) {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return null;
  return Math.trunc(parsed);
}

function toNullableText(value) {
  if (value == null || value === "") return null;
  return value;
}

async function main() {
  const raw = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error("CSV has no data rows");
  }

  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = cols[idx] ?? "";
    });
    return obj;
  });

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
    multipleStatements: true,
  });

  try {
    await conn.beginTransaction();

    await conn.query("SET FOREIGN_KEY_CHECKS=0");
    await conn.query("DELETE FROM scheme_rules");
    await conn.query("DELETE FROM eligibility_rules");
    await conn.query("DELETE FROM schemes");
    await conn.query("SET FOREIGN_KEY_CHECKS=1");

    const insertSql = `
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
      VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

    for (const row of rows) {
      const schemeId = Number(row.scheme_id);
      const category = toNullableText(row.category) ?? "General";

      const values = [
        schemeId,
        row.scheme_name,
        category,
        toNullableText(row.benefits),
        row.state,
        category,
        toNullableText(row.eligibility),
        toNullableText(row.benefits),
        toNullableText(row.documents),
        toNullableText(row.apply_link),
        toNullableInt(row.min_age),
        toNullableInt(row.max_age),
        toNullableInt(row.income_max),
        row.gender_allowed || "Any",
        toNullableInt(row.rules_verified) ?? 0,
        toNullableText(row.rule_source),
      ];

      await conn.execute(insertSql, values);
    }

    await conn.commit();
    console.log(`Imported ${rows.length} schemes into ${process.env.DB_NAME}.schemes`);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    await conn.end();
  }
}

main().catch((error) => {
  console.error("Import failed:", error.message);
  process.exit(1);
});
