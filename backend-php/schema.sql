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

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  active TINYINT DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pocket Money Accounts
CREATE TABLE IF NOT EXISTS pocket_money_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  participant_id INT NOT NULL,
  camp_id INT NOT NULL,
  balance DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(participant_id, camp_id),
  INDEX(participant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Transactions (Sales)
CREATE TABLE IF NOT EXISTS transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  account_id INT NOT NULL,
  product_id INT,
  amount DECIMAL(10, 2) NOT NULL,
  type ENUM('sale', 'deposit', 'refund') DEFAULT 'sale',
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(account_id) REFERENCES pocket_money_accounts(id),
  INDEX(account_id),
  INDEX(created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default products
INSERT IGNORE INTO products (id, name, price, category) VALUES
(1, '🥤 Wasser', 1.00, 'Getränk'),
(2, '🧃 Saft', 2.00, 'Getränk'),
(3, '🍦 Eis', 2.50, 'Essen'),
(4, '🍪 Keks', 1.50, 'Essen'),
(5, '🎫 Lagerfeuer', 5.00, 'Event');
