-- Migration: Update camps table to match application requirements
-- This migration updates the camps table structure

-- First, check if the table exists and update it
ALTER TABLE camps
MODIFY COLUMN name VARCHAR(255) NOT NULL,
CHANGE COLUMN date_start start_date DATE NOT NULL,
CHANGE COLUMN date_end end_date DATE NOT NULL,
CHANGE COLUMN location location VARCHAR(255),
CHANGE COLUMN theme description VARCHAR(500),
MODIFY COLUMN max_participants INT DEFAULT 50,
CHANGE COLUMN gebuehr_betrag fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN status ENUM('active', 'inactive', 'archived') DEFAULT 'active' AFTER fee,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Drop the old active column if it exists (note: this is commented as it may not exist after renaming)
-- ALTER TABLE camps DROP COLUMN active;
