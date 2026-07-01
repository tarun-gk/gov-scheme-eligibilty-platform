-- 02_create_table_schemes.sql
-- Create schemes table for structured and semi-structured eligibility

CREATE TABLE IF NOT EXISTS schemes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  income_limit INT NULL,
  age_min INT NULL,
  age_max INT NULL,
  gender VARCHAR(50) NULL,
  occupation VARCHAR(100) NULL,
  caste_category VARCHAR(50) NULL,
  state VARCHAR(100) NULL,
  land_ownership VARCHAR(100) NULL,
  benefits TEXT NULL,
  documents_required TEXT NULL,
  official_link VARCHAR(500) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
