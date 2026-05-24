-- Use existing database
USE d0470938;

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  camp_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  description TEXT,
  released TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(camp_id),
  INDEX(created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Camps table (for reference)
CREATE TABLE IF NOT EXISTS camps (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  date_start DATE,
  date_end DATE,
  active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample camp
INSERT IGNORE INTO camps (id, name, date_start, date_end) VALUES 
(1, 'BULA2026', '2026-07-01', '2026-07-31');
