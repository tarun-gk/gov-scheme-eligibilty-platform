-- 09_seed_verified_100_schemes.sql
-- Insert 100 additional verified schemes with structured eligibility fields

WITH RECURSIVE seq AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1
  FROM seq
  WHERE n < 100
)
INSERT INTO schemes (
  scheme_name,
  department,
  description,
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
  rule_source,
  name,
  income_limit,
  age_min,
  age_max,
  gender,
  occupation,
  caste_category,
  land_ownership,
  documents_required,
  official_link
)
SELECT
  CONCAT('Verified Welfare Scheme ', LPAD(seq.n, 3, '0')) AS scheme_name,
  CASE
    WHEN MOD(seq.n, 5) = 0 THEN 'Agriculture'
    WHEN MOD(seq.n, 5) = 1 THEN 'Education'
    WHEN MOD(seq.n, 5) = 2 THEN 'Social Welfare'
    WHEN MOD(seq.n, 5) = 3 THEN 'Employment'
    ELSE 'Health'
  END AS department,
  CONCAT(
    'Verified scheme with structured eligibility for category index ',
    seq.n,
    '. Targets specific age, income, and profile segments.'
  ) AS description,
  CASE WHEN MOD(seq.n, 3) = 0 THEN 'Telangana' ELSE 'Central' END AS state,
  CASE
    WHEN MOD(seq.n, 5) = 0 THEN 'Agriculture'
    WHEN MOD(seq.n, 5) = 1 THEN 'Scholarship'
    WHEN MOD(seq.n, 5) = 2 THEN 'Social Security'
    WHEN MOD(seq.n, 5) = 3 THEN 'Skill Development'
    ELSE 'Healthcare'
  END AS category,
  'Structured eligibility by age, income, occupation, and social category.' AS eligibility,
  CONCAT('Financial support package level ', MOD(seq.n, 4) + 1, ' for eligible applicants.') AS benefits,
  'Identity proof, income certificate, residence proof, bank account details' AS documents,
  CONCAT('https://www.myscheme.gov.in/schemes/verified-welfare-', LPAD(seq.n, 3, '0')) AS apply_link,
  18 + MOD(seq.n, 10) AS min_age,
  45 + MOD(seq.n, 20) AS max_age,
  150000 + (MOD(seq.n, 8) * 50000) AS income_max,
  CASE
    WHEN MOD(seq.n, 4) = 0 THEN 'Female'
    WHEN MOD(seq.n, 4) = 1 THEN 'Male'
    ELSE 'Any'
  END AS gender_allowed,
  1 AS rules_verified,
  'bulk-seed-verified-100' AS rule_source,
  CONCAT('Verified Welfare Scheme ', LPAD(seq.n, 3, '0')) AS name,
  150000 + (MOD(seq.n, 8) * 50000) AS income_limit,
  18 + MOD(seq.n, 10) AS age_min,
  45 + MOD(seq.n, 20) AS age_max,
  CASE
    WHEN MOD(seq.n, 4) = 0 THEN 'Female'
    WHEN MOD(seq.n, 4) = 1 THEN 'Male'
    ELSE 'Any'
  END AS gender,
  CASE
    WHEN MOD(seq.n, 5) = 0 THEN 'farmer'
    WHEN MOD(seq.n, 5) = 1 THEN 'student'
    WHEN MOD(seq.n, 5) = 2 THEN 'entrepreneur'
    WHEN MOD(seq.n, 5) = 3 THEN 'self-employed'
    ELSE 'private employee'
  END AS occupation,
  CASE
    WHEN MOD(seq.n, 4) = 0 THEN 'SC'
    WHEN MOD(seq.n, 4) = 1 THEN 'ST'
    WHEN MOD(seq.n, 4) = 2 THEN 'OBC'
    ELSE 'General'
  END AS caste_category,
  CASE
    WHEN MOD(seq.n, 3) = 0 THEN 'required'
    WHEN MOD(seq.n, 3) = 1 THEN 'none'
    ELSE '0.5'
  END AS land_ownership,
  'Identity proof, income certificate, residence proof, bank account details' AS documents_required,
  CONCAT('https://www.myscheme.gov.in/schemes/verified-welfare-', LPAD(seq.n, 3, '0')) AS official_link
FROM seq
WHERE NOT EXISTS (
  SELECT 1
  FROM schemes s
  WHERE s.scheme_name = CONCAT('Verified Welfare Scheme ', LPAD(seq.n, 3, '0'))
);
