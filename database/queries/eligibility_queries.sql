-- eligibility_queries.sql
-- Eligibility filter example (User: Telangana, Male, age 24, income 150000)

SELECT s.scheme_id, s.scheme_name, s.category, s.apply_link
FROM schemes s
WHERE s.state = 'Telangana'
AND (s.min_age IS NULL OR 24 >= s.min_age)
AND (s.max_age IS NULL OR 24 <= s.max_age)
AND (s.income_max IS NULL OR 150000 <= s.income_max)
AND (s.gender_allowed = 'Any' OR s.gender_allowed = 'Male')
ORDER BY s.rules_verified DESC, s.scheme_id;
