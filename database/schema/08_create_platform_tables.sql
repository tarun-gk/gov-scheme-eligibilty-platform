-- 08_create_platform_tables.sql
-- Additional tables for AI Government Scheme Navigator platform

CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  profile_data JSON NULL,
  age INT NULL,
  income INT NULL,
  gender VARCHAR(50) NULL,
  occupation VARCHAR(120) NULL,
  caste_category VARCHAR(50) NULL,
  state VARCHAR(120) NULL,
  land_owned DECIMAL(10,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_profiles_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS scheme_keywords (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  scheme_id BIGINT NOT NULL,
  keyword VARCHAR(120) NOT NULL,
  source ENUM('local','ai') NOT NULL DEFAULT 'local',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_scheme_keywords_scheme (scheme_id),
  INDEX idx_scheme_keywords_keyword (keyword)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS eligibility_results (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  user_profile_id BIGINT NULL,
  scheme_id BIGINT NULL,
  eligibility_status VARCHAR(40) NOT NULL,
  confidence_score INT NOT NULL,
  reason TEXT NULL,
  ai_explanation TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_eligibility_results_user (user_id),
  INDEX idx_eligibility_results_profile (user_profile_id),
  INDEX idx_eligibility_results_scheme (scheme_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
