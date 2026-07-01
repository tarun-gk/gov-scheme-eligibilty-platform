-- 05_create_table_users.sql
-- Create users profile table for eligibility checks

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  age INT NULL,
  income INT NULL,
  gender VARCHAR(50) NULL,
  occupation VARCHAR(100) NULL,
  caste_category VARCHAR(50) NULL,
  state VARCHAR(100) NULL,
  land_owned DECIMAL(10,2) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
