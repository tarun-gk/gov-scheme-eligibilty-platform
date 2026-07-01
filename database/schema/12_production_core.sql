CREATE TABLE IF NOT EXISTS account_sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  account_id BIGINT NOT NULL,
  refresh_token_hash CHAR(64) NOT NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(500) NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_account_sessions_refresh_token_hash (refresh_token_hash),
  INDEX idx_account_sessions_account_id (account_id),
  INDEX idx_account_sessions_expires_at (expires_at),
  CONSTRAINT fk_account_sessions_account
    FOREIGN KEY (account_id) REFERENCES accounts(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  request_id VARCHAR(64) NOT NULL,
  actor_id BIGINT NULL,
  actor_role VARCHAR(40) NOT NULL,
  action VARCHAR(120) NOT NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(500) NULL,
  status_code INT NOT NULL,
  duration_ms INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_logs_actor (actor_id),
  INDEX idx_audit_logs_action (action),
  INDEX idx_audit_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS interaction_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  account_id BIGINT NOT NULL,
  profile_id BIGINT NULL,
  scheme_id INT NOT NULL,
  event_type ENUM('viewed','shortlisted','applied','approved','rejected','eligible-update') NOT NULL,
  event_metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_interaction_events_account (account_id),
  INDEX idx_interaction_events_scheme (scheme_id),
  INDEX idx_interaction_events_type (event_type),
  INDEX idx_interaction_events_created_at (created_at),
  CONSTRAINT fk_interaction_events_account
    FOREIGN KEY (account_id) REFERENCES accounts(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_interaction_events_scheme
    FOREIGN KEY (scheme_id) REFERENCES schemes(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS notification_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  account_id BIGINT NOT NULL,
  channel ENUM('in_app','sms','whatsapp','email') NOT NULL,
  title VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  payload JSON NULL,
  status ENUM('pending','sent','failed') NOT NULL DEFAULT 'pending',
  failure_reason VARCHAR(500) NULL,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notification_events_account (account_id),
  INDEX idx_notification_events_status (status),
  INDEX idx_notification_events_created_at (created_at),
  CONSTRAINT fk_notification_events_account
    FOREIGN KEY (account_id) REFERENCES accounts(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET @has_source_url := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'schemes' AND COLUMN_NAME = 'source_url'
);
SET @sql := IF(@has_source_url = 0, 'ALTER TABLE schemes ADD COLUMN source_url VARCHAR(500) NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_verified_at := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'schemes' AND COLUMN_NAME = 'verified_at'
);
SET @sql := IF(@has_verified_at = 0, 'ALTER TABLE schemes ADD COLUMN verified_at TIMESTAMP NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_quality_score := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'schemes' AND COLUMN_NAME = 'quality_score'
);
SET @sql := IF(@has_quality_score = 0, 'ALTER TABLE schemes ADD COLUMN quality_score INT NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_language_code := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'schemes' AND COLUMN_NAME = 'language_code'
);
SET @sql := IF(@has_language_code = 0, 'ALTER TABLE schemes ADD COLUMN language_code VARCHAR(10) NULL DEFAULT ''en''', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_embedding_version := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'schemes' AND COLUMN_NAME = 'embedding_version'
);
SET @sql := IF(@has_embedding_version = 0, 'ALTER TABLE schemes ADD COLUMN embedding_version VARCHAR(50) NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_idx_schemes_state_name := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'schemes' AND INDEX_NAME = 'idx_schemes_state_name'
);
SET @sql := IF(@has_idx_schemes_state_name = 0, 'CREATE INDEX idx_schemes_state_name ON schemes(state, name)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_idx_eligibility_results_profile_created := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eligibility_results' AND INDEX_NAME = 'idx_eligibility_results_profile_created'
);
SET @sql := IF(@has_idx_eligibility_results_profile_created = 0, 'CREATE INDEX idx_eligibility_results_profile_created ON eligibility_results(user_profile_id, created_at)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_idx_user_profiles_account_created := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_profiles' AND INDEX_NAME = 'idx_user_profiles_account_created'
);
SET @sql := IF(@has_idx_user_profiles_account_created = 0, 'CREATE INDEX idx_user_profiles_account_created ON user_profiles(account_id, created_at)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
