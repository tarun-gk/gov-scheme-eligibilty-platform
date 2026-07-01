-- 06_seed_initial_schemes.sql
-- Insert initial schemes for eligibility engine validation

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
  'PM Kisan',
  'Agriculture',
  'Income support for small and marginal farmers with cultivable land.',
  'Telangana',
  'Agriculture',
  'Income and farmer profile based support.',
  'Direct income support to eligible farmers.',
  'Aadhaar, bank passbook, land records',
  'https://pmkisan.gov.in/',
  18,
  NULL,
  300000,
  'Any',
  1,
  'seed-script',
  'PM Kisan',
  300000,
  18,
  NULL,
  'Any',
  'farmer',
  NULL,
  'required',
  'Aadhaar, bank passbook, land records',
  'https://pmkisan.gov.in/'
WHERE NOT EXISTS (SELECT 1 FROM schemes WHERE scheme_name = 'PM Kisan');

INSERT INTO schemes (
  scheme_name, department, description, state, category, eligibility, benefits, documents, apply_link,
  min_age, max_age, income_max, gender_allowed, rules_verified, rule_source,
  name, income_limit, age_min, age_max, gender, occupation, caste_category, land_ownership, documents_required, official_link
)
SELECT
  'Startup India', 'MSME',
  'Supports startup founders and entrepreneurs through recognition, tax benefits, and facilitation.',
  'Central', 'Entrepreneurship',
  'Focused on startup and entrepreneur ecosystem.',
  'Recognition, support, and easier compliance for startups.',
  'Business details, identity, incorporation documents',
  'https://www.startupindia.gov.in/',
  18, 60, NULL, 'Any', 0, 'seed-script',
  'Startup India', NULL, 18, 60, 'Any', NULL, NULL, NULL,
  'Business details, identity, incorporation documents', 'https://www.startupindia.gov.in/'
WHERE NOT EXISTS (SELECT 1 FROM schemes WHERE scheme_name = 'Startup India');

INSERT INTO schemes (
  scheme_name, department, description, state, category, eligibility, benefits, documents, apply_link,
  min_age, max_age, income_max, gender_allowed, rules_verified, rule_source,
  name, income_limit, age_min, age_max, gender, occupation, caste_category, land_ownership, documents_required, official_link
)
SELECT
  'Stand Up India', 'MSME',
  'Facilitates bank loans for SC/ST and women entrepreneurs for greenfield enterprises.',
  'Central', 'Entrepreneurship',
  'Targets entrepreneurs and enterprise setup.',
  'Bank loans for enterprise setup.',
  'Identity proof, caste certificate, project report',
  'https://www.standupmitra.in/',
  18, 65, NULL, 'Any', 0, 'seed-script',
  'Stand Up India', NULL, 18, 65, 'Any', 'entrepreneur', NULL, NULL,
  'Identity proof, caste certificate, project report', 'https://www.standupmitra.in/'
WHERE NOT EXISTS (SELECT 1 FROM schemes WHERE scheme_name = 'Stand Up India');

INSERT INTO schemes (
  scheme_name, department, description, state, category, eligibility, benefits, documents, apply_link,
  min_age, max_age, income_max, gender_allowed, rules_verified, rule_source,
  name, income_limit, age_min, age_max, gender, occupation, caste_category, land_ownership, documents_required, official_link
)
SELECT
  'PM Awas Yojana', 'Housing',
  'Affordable housing support for eligible low-income families and rural/urban beneficiaries.',
  'Central', 'Housing',
  'Low-income household support for housing.',
  'Housing subsidy and assistance.',
  'Income proof, residence proof, Aadhaar',
  'https://pmaymis.gov.in/',
  18, NULL, 600000, 'Any', 1, 'seed-script',
  'PM Awas Yojana', 600000, 18, NULL, 'Any', NULL, NULL, NULL,
  'Income proof, residence proof, Aadhaar', 'https://pmaymis.gov.in/'
WHERE NOT EXISTS (SELECT 1 FROM schemes WHERE scheme_name = 'PM Awas Yojana');

INSERT INTO schemes (
  scheme_name, department, description, state, category, eligibility, benefits, documents, apply_link,
  min_age, max_age, income_max, gender_allowed, rules_verified, rule_source,
  name, income_limit, age_min, age_max, gender, occupation, caste_category, land_ownership, documents_required, official_link
)
SELECT
  'National Scholarship Scheme', 'Education',
  'Scholarship support for students from economically weaker sections and reserved categories.',
  'Central', 'Education',
  'Student support based on income and education criteria.',
  'Scholarship assistance for education.',
  'Marksheet, income certificate, bank details',
  'https://scholarships.gov.in/',
  14, 30, 250000, 'Any', 1, 'seed-script',
  'National Scholarship Scheme', 250000, 14, 30, 'Any', 'student', NULL, NULL,
  'Marksheet, income certificate, bank details', 'https://scholarships.gov.in/'
WHERE NOT EXISTS (SELECT 1 FROM schemes WHERE scheme_name = 'National Scholarship Scheme');
