-- BULA2026 Zeltlagersystem Database Schema
-- Lagerbank POS System

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Drop all existing tables (in correct order for foreign keys)
DROP TABLE IF EXISTS transaction_items;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS pocket_money_accounts;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS check_ins;
DROP TABLE IF EXISTS tents;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS participants;
DROP TABLE IF EXISTS camps;
DROP TABLE IF EXISTS users;

-- Users Table (Admins, Staff, Parents)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    vorname VARCHAR(100) NOT NULL,
    nachname VARCHAR(100) NOT NULL,
    role ENUM('admin', 'ma', 'eltern') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Camps Table
CREATE TABLE IF NOT EXISTS camps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    date_start DATE NOT NULL,
    date_end DATE NOT NULL,
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Participants Table
CREATE TABLE IF NOT EXISTS participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    camp_id INT NOT NULL,
    vorname VARCHAR(100) NOT NULL,
    nachname VARCHAR(100) NOT NULL,
    alter INT,
    geschlecht VARCHAR(20),
    kontakt_name VARCHAR(255),
    kontakt_email VARCHAR(255),
    kontakt_tel VARCHAR(20),
    guthaben DECIMAL(10, 2) DEFAULT 0,
    checked_in TINYINT(1) DEFAULT 0,
    checked_in_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (camp_id) REFERENCES camps(id),
    INDEX idx_camp (camp_id),
    INDEX idx_checked_in (checked_in)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Check-in Records
CREATE TABLE IF NOT EXISTS check_ins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    participant_id INT NOT NULL,
    camp_id INT NOT NULL,
    checked_in TINYINT(1) DEFAULT 0,
    checked_in_at TIMESTAMP NULL,
    checked_in_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participant_id) REFERENCES participants(id),
    FOREIGN KEY (camp_id) REFERENCES camps(id),
    FOREIGN KEY (checked_in_by) REFERENCES users(id),
    INDEX idx_participant_camp (participant_id, camp_id),
    UNIQUE KEY unique_checkin (participant_id, camp_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activities Table
CREATE TABLE IF NOT EXISTS activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    camp_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    beschreibung TEXT,
    datum DATE NOT NULL,
    uhrzeit TIME,
    ort VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (camp_id) REFERENCES camps(id),
    INDEX idx_camp (camp_id),
    INDEX idx_datum (datum)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tents Table
CREATE TABLE IF NOT EXISTS tents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    camp_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    kapazitaet INT NOT NULL,
    belegt INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (camp_id) REFERENCES camps(id),
    INDEX idx_camp (camp_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products Table (for Verkauf/POS system)
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    icon VARCHAR(10),
    is_restricted TINYINT(1) DEFAULT 0,
    is_alcohol TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pocket Money Accounts
CREATE TABLE IF NOT EXISTS pocket_money_accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    participant_id INT NOT NULL,
    camp_id INT NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participant_id) REFERENCES participants(id),
    FOREIGN KEY (camp_id) REFERENCES camps(id),
    UNIQUE KEY unique_account (participant_id, camp_id),
    INDEX idx_participant (participant_id),
    INDEX idx_camp (camp_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions Table (for Verkauf history)
CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    transaction_type ENUM('purchase', 'deposit', 'withdrawal', 'refund') DEFAULT 'purchase',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_type (transaction_type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transaction Items (details of what was sold)
CREATE TABLE IF NOT EXISTS transaction_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    price_at_time DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_transaction (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default products
INSERT INTO products (name, price, icon, is_restricted, is_alcohol) VALUES
('Wasser', 1.00, '💧', 0, 0),
('Saft', 2.00, '🧃', 0, 0),
('Eis', 2.50, '🍦', 0, 0),
('Keks', 1.50, '🍪', 0, 0),
('Lagerfeuer Getränk', 5.00, '🔥', 1, 1)
ON DUPLICATE KEY UPDATE price=VALUES(price);

-- Insert sample camp (BULA2026)
INSERT INTO camps (name, date_start, date_end, active) VALUES
('BULA 2026 Hauptcamp', '2026-07-20', '2026-08-02', 1)
ON DUPLICATE KEY UPDATE date_start=VALUES(date_start);

-- Insert sample admin user (password: admin123)
INSERT INTO users (email, vorname, nachname, role, password) VALUES
('admin@bula2026.de', 'Admin', 'User', 'admin', '$2y$10$r9h7cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMm2')
ON DUPLICATE KEY UPDATE email=email;
