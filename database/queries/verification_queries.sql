-- verification_queries.sql
-- Verified schemes by state

SELECT s.scheme_id, s.scheme_name, s.state, s.category,
       s.min_age, s.max_age, s.income_max, s.gender_allowed, s.rules_verified
FROM schemes s
WHERE s.state = 'Telangana'
AND s.rules_verified = 1
ORDER BY s.scheme_id;
