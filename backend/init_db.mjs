import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 3306,
  multipleStatements: true
};

const dbName = process.env.DB_NAME || 'gov_scheme_eligibility';
const schemaDir = path.join(__dirname, '..', 'database', 'schema');

async function initDB() {
  const conn = await mysql.createConnection(dbConfig);
  console.log(`Creating database '${dbName}'...`);
  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  } catch(e) { /* ignore */ }
  await conn.query(`USE \`${dbName}\``);

  // Execute schema files in order
  const files = [
    '02_create_table_schemes.sql',
    '03_constraints_indexes.sql',
    '04_views.sql',
    '05_create_table_users.sql',
    '08_create_platform_tables.sql',
    '10_create_accounts_table.sql',
    '12_production_core.sql',
  ];

  for (const file of files) {
    const filePath = path.join(schemaDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${file}`);
      continue;
    }

    console.log(`Executing: ${file}`);
    try {
      const sql = fs.readFileSync(filePath, 'utf8');
      await conn.query(sql);
      console.log(`${file} completed`);
    } catch(e) {
      // Ignore "already exists" errors
      if (e.code === 'ER_TABLE_EXISTS_ERROR' || e.code === 1050 || 
          e.code === 'ER_DUP_KEYNAME' || e.code === 1061) {
        console.warn(`${file}: Skipping (already exists)`);
      } else {
        console.error(`Error in ${file}:`, e.message);
      }
    }
  }

  // Seed sample schemes
  const seedFile = '09_seed_verified_100_schemes_compat.sql';
  console.log(`\nSeeding: ${seedFile}`);
  try {
    const sql = fs.readFileSync(path.join(schemaDir, seedFile), 'utf8');
    const statements = sql
      .split(/;\s*\n/)
      .map(s => s.replace(/^USE [^;]+;?\s*/i, '').trim())
      .filter(s => s.length > 5);
    let ok = 0, warn = 0;
    for (const stmt of statements) {
      try {
        await conn.query(stmt);
        ok++;
      } catch(e) {
        warn++;
      }
    }
    console.log(`${seedFile} - ${ok} statements ok, ${warn} warnings`);
  } catch(e) {
    console.warn(`Could not seed schemes:`, e.message);
  }

  console.log('\nDatabase initialization complete');
  await conn.end();
}

initDB().catch(e => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
