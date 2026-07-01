-- 10_create_accounts_table.sql
-- Login accounts for authentication (separate from beneficiary user_profiles)

CREATE TABLE IF NOT EXISTS accounts (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  name       VARCHAR(255) NOT NULL,
  role       ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_accounts_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Link user_profiles to logged-in accounts
SET @has_account_id := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'user_profiles'
    AND COLUMN_NAME = 'account_id'
);
SET @sql := IF(
  @has_account_id = 0,
  'ALTER TABLE user_profiles ADD COLUMN account_id BIGINT NULL AFTER id',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_account_idx := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'user_profiles'
    AND INDEX_NAME = 'idx_user_profiles_account'
);
SET @sql := IF(
  @has_account_idx = 0,
  'ALTER TABLE user_profiles ADD INDEX idx_user_profiles_account (account_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
