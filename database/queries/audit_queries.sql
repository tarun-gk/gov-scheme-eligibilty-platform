-- audit_queries.sql
-- Counts and distributions (use in report screenshots)

SELECT COUNT(*) AS total_schemes FROM schemes;

SELECT rules_verified, COUNT(*) AS cnt
FROM schemes
GROUP BY rules_verified;

SELECT state, COUNT(*) AS cnt
FROM schemes
GROUP BY state;

SHOW CREATE TABLE schemes;
SHOW INDEX FROM schemes;

SELECT * FROM v_verified_schemes;
SELECT * FROM v_telangana_schemes;
