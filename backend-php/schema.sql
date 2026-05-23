-- BULA2026 Zeltlager-Verwaltungssystem
-- MySQL Schema für All-Inkl Hosting
-- UTF-8 Encoding

-- Users Table
CREATE TABLE auth_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    vorname VARCHAR(100),
    nachname VARCHAR(100),
    role ENUM('admin', 'ma', 'eltern') DEFAULT 'eltern',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin account (password: admin123 hashed with bcrypt)
INSERT INTO auth_users (email, password, vorname, nachname, role) VALUES
('admin@lagerbank.info', '$2y$10$5h7.mNqN9v6J6OKm0L3Y0.9h8oKqN8zJzN7q4q3W5q9q0q8e8b0kK', 'Admin', 'User', 'admin');

-- Camps Table
CREATE TABLE camps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    date_start DATE NOT NULL,
    date_end DATE NOT NULL,
    location VARCHAR(255),
    theme VARCHAR(255),
    max_participants INT DEFAULT 80,
    gebuehr_betrag DECIMAL(10,2) DEFAULT 250.00,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registrations Table
CREATE TABLE registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    camp_id INT NOT NULL,
    user_id INT,
    status ENUM('angemeldet', 'bestätigt', 'warteliste', 'abgelehnt') DEFAULT 'angemeldet',

    -- Participant Info
    tn_familienname VARCHAR(100) NOT NULL,
    tn_vorname VARCHAR(100) NOT NULL,
    tn_strasse VARCHAR(255),
    tn_plz VARCHAR(10),
    tn_ort VARCHAR(100),
    tn_geburtsdatum DATE NOT NULL,
    tn_geschlecht ENUM('männlich', 'weiblich', 'divers'),
    tn_telefon VARCHAR(20),
    tn_email VARCHAR(255),
    tn_konfession VARCHAR(100),

    -- Parent/Guardian Info
    sorge_anrede VARCHAR(50),
    sorge_familienname VARCHAR(100) NOT NULL,
    sorge_vorname VARCHAR(100) NOT NULL,
    sorge_strasse VARCHAR(255) NOT NULL,
    sorge_plz VARCHAR(10) NOT NULL,
    sorge_ort VARCHAR(100) NOT NULL,
    sorge_telefon_festnetz VARCHAR(20),
    sorge_telefon_mobil VARCHAR(20) NOT NULL,
    sorge_email VARCHAR(255) NOT NULL,
    sorge_beruf VARCHAR(100),

    -- Emergency Contact
    notfall_name VARCHAR(255) NOT NULL,
    notfall_telefon VARCHAR(20) NOT NULL,
    notfall_beziehung VARCHAR(100) NOT NULL,

    -- Health Insurance
    krankenkasse VARCHAR(255) NOT NULL,
    versicherten_nr VARCHAR(50),
    kk_karte_mitgebracht BOOLEAN DEFAULT false,
    hausarztmodell BOOLEAN DEFAULT false,
    hausarzt TEXT,

    -- Health Info
    allergien TEXT,
    vegetarier BOOLEAN DEFAULT false,
    vegan BOOLEAN DEFAULT false,
    kein_schweinefleisch BOOLEAN DEFAULT false,
    medikamente TEXT,
    erkrankungen TEXT,
    besonderheiten TEXT,

    -- Swimming
    schwimmer BOOLEAN DEFAULT false,
    schwimm_erlaubnis BOOLEAN DEFAULT false,

    -- Consents
    foto_einwilligung BOOLEAN DEFAULT false,
    rki_gelesen BOOLEAN DEFAULT false,
    gesundheit_bestaetigung BOOLEAN DEFAULT false,
    medikamente_gabe_erlaubnis BOOLEAN DEFAULT false,

    -- Signatures
    sig_sorge LONGBLOB,
    sig_tn LONGBLOB,

    -- Payment
    gebuehr_bezahlt BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (camp_id) REFERENCES camps(id),
    FOREIGN KEY (user_id) REFERENCES auth_users(id),
    INDEX idx_camp_id (camp_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Participants Table
CREATE TABLE participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    camp_id INT NOT NULL,
    user_id INT,
    registration_id INT NOT NULL,
    foto_url VARCHAR(500),
    zelt_id INT,
    status ENUM('angekommen', 'krank', 'gesund') DEFAULT 'gesund',
    check_in_time TIMESTAMP NULL,
    checked_in_by_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (camp_id) REFERENCES camps(id),
    FOREIGN KEY (user_id) REFERENCES auth_users(id),
    FOREIGN KEY (registration_id) REFERENCES registrations(id),
    FOREIGN KEY (checked_in_by_id) REFERENCES auth_users(id),
    INDEX idx_camp_id (camp_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tents Table
CREATE TABLE tents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    camp_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    capacity INT DEFAULT 8,
    color VARCHAR(20),
    icon VARCHAR(50),
    position_x DECIMAL(10,2),
    position_y DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (camp_id) REFERENCES camps(id),
    INDEX idx_camp_id (camp_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update participants with tent_id
ALTER TABLE participants ADD FOREIGN KEY (zelt_id) REFERENCES tents(id);

-- Activities Table
CREATE TABLE activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    camp_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('hobbygruppe', 'sport', 'kreativ', 'geländespiel', 'sonstiges'),
    location VARCHAR(255),
    group_size INT DEFAULT 10,
    fairness_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (camp_id) REFERENCES camps(id),
    INDEX idx_camp_id (camp_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Groups Table
CREATE TABLE activity_groups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    activity_id INT NOT NULL,
    group_number INT NOT NULL,
    betreuer_id INT,
    fairness_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (activity_id) REFERENCES activities(id),
    FOREIGN KEY (betreuer_id) REFERENCES auth_users(id),
    INDEX idx_activity_id (activity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Group Members Table
CREATE TABLE activity_group_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    activity_group_id INT NOT NULL,
    participant_id INT NOT NULL,
    attended BOOLEAN,
    notizen TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (activity_group_id) REFERENCES activity_groups(id),
    FOREIGN KEY (participant_id) REFERENCES participants(id),
    INDEX idx_activity_group_id (activity_group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pocket Money Accounts Table
CREATE TABLE pocket_money_accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    participant_id INT UNIQUE NOT NULL,
    initial_balance DECIMAL(10,2) DEFAULT 0.00,
    current_balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (participant_id) REFERENCES participants(id),
    INDEX idx_participant_id (participant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions Table
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    participant_id INT NOT NULL,
    account_id INT NOT NULL,
    product_name VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(500),
    ma_user_id INT,
    synced BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (participant_id) REFERENCES participants(id),
    FOREIGN KEY (account_id) REFERENCES pocket_money_accounts(id),
    FOREIGN KEY (ma_user_id) REFERENCES auth_users(id),
    INDEX idx_participant_id (participant_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Pairing History Table
CREATE TABLE activity_pairing_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    participant_a_id INT NOT NULL,
    participant_b_id INT NOT NULL,
    activity_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (participant_a_id) REFERENCES participants(id),
    FOREIGN KEY (participant_b_id) REFERENCES participants(id),
    FOREIGN KEY (activity_id) REFERENCES activities(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Photos Table
CREATE TABLE photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    camp_id INT NOT NULL,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    released BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (camp_id) REFERENCES camps(id),
    FOREIGN KEY (user_id) REFERENCES auth_users(id),
    INDEX idx_camp_id (camp_id),
    INDEX idx_released (released)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Data: Create Default Camp
INSERT INTO camps (name, date_start, date_end, location, theme)
VALUES ('BULA2026', '2026-07-18', '2026-07-25', 'Schweiz', 'Abenteuer und Gemeinschaft');

-- Create Admin User (CHANGE THIS!)
INSERT INTO users (email, password_hash, vorname, nachname, role, active)
VALUES ('admin@lagerbank.info', '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36LRW6Vm', 'Admin', 'BULA', 'admin', true);
