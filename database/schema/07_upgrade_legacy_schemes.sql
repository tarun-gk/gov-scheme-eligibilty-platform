-- 07_upgrade_legacy_schemes.sql
-- Safely upgrade legacy schemes table without breaking existing foreign keys

ALTER TABLE schemes
  ADD COLUMN id BIGINT NULL,
  ADD COLUMN name VARCHAR(255) NULL,
  ADD COLUMN income_limit INT NULL,
  ADD COLUMN age_min INT NULL,
  ADD COLUMN age_max INT NULL,
  ADD COLUMN gender VARCHAR(50) NULL,
  ADD COLUMN occupation VARCHAR(100) NULL,
  ADD COLUMN caste_category VARCHAR(50) NULL,
  ADD COLUMN land_ownership VARCHAR(100) NULL,
  ADD COLUMN documents_required TEXT NULL,
  ADD COLUMN official_link VARCHAR(500) NULL;

UPDATE schemes
SET
  id = COALESCE(id, scheme_id),
  name = COALESCE(name, scheme_name),
  age_min = COALESCE(age_min, min_age),
  age_max = COALESCE(age_max, max_age),
  income_limit = COALESCE(income_limit, income_max),
  gender = COALESCE(gender, gender_allowed),
  documents_required = COALESCE(documents_required, documents),
  official_link = COALESCE(official_link, apply_link)
WHERE
  id IS NULL
  OR name IS NULL
  OR age_min IS NULL
  OR age_max IS NULL
  OR income_limit IS NULL
  OR gender IS NULL
  OR documents_required IS NULL
  OR official_link IS NULL;
