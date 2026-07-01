-- 04_views.sql
-- Create views used for reporting and faster read access

CREATE OR REPLACE VIEW v_verified_schemes AS
SELECT scheme_id, scheme_name, state, category, min_age, max_age, income_max, gender_allowed, rule_source
FROM schemes
WHERE rules_verified = 1;

CREATE OR REPLACE VIEW v_telangana_schemes AS
SELECT scheme_id, scheme_name, category, apply_link
FROM schemes
WHERE state = 'Telangana';
