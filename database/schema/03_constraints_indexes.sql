-- 03_constraints_indexes.sql
-- Add indexes and constraints for scalability + integrity

CREATE INDEX idx_schemes_state ON schemes(state);
CREATE INDEX idx_schemes_category ON schemes(category);
CREATE INDEX idx_schemes_verified ON schemes(rules_verified);
CREATE INDEX idx_schemes_gender ON schemes(gender_allowed);
CREATE INDEX idx_schemes_age ON schemes(min_age, max_age);
CREATE INDEX idx_schemes_income ON schemes(income_max);

ALTER TABLE schemes
ADD CONSTRAINT chk_min_age CHECK (min_age IS NULL OR min_age BETWEEN 0 AND 120),
ADD CONSTRAINT chk_max_age CHECK (max_age IS NULL OR max_age BETWEEN 0 AND 120),
ADD CONSTRAINT chk_age_range CHECK (
  (min_age IS NULL OR max_age IS NULL) OR (min_age <= max_age)
),
ADD CONSTRAINT chk_income_max CHECK (income_max IS NULL OR income_max >= 0);
