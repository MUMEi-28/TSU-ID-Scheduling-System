CREATE DATABASE tsuidschedule;

USE tsuidschedule;

-- MIGRATION NOTE: id_reason is now VARCHAR(100) instead of ENUM for flexibility (2024-06-09)
-- If upgrading, run: ALTER TABLE students MODIFY id_reason VARCHAR(100) NOT NULL;

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    student_number VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    id_reason VARCHAR(100) NOT NULL,
    data_privacy_agreed BOOLEAN DEFAULT FALSE NOT NULL,
    schedule_date VARCHAR(30),
    schedule_time VARCHAR(30),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_student_number CHECK (LENGTH(student_number) = 10),
    CONSTRAINT chk_email_format CHECK (email IS NULL OR email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_schedule_consistency CHECK (
        (schedule_date IS NULL AND schedule_time IS NULL) OR 
        (schedule_date IS NOT NULL AND schedule_time IS NOT NULL)
    )
);

CREATE TABLE slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slot_date VARCHAR(30) NOT NULL,
    -- CANONICAL FORMAT: slot_time should always be in the format '8:00am-9:00am', '9:00am-10:00am', etc. (no spaces, lowercase am/pm)
    -- Use normalize_slot_time() function in PHP or normalizeSlotTime() in JS before any DB operations
    slot_time VARCHAR(20) NOT NULL,
    booked_count INT DEFAULT 0 CHECK (booked_count >= 0),
    max_capacity INT DEFAULT 12 CHECK (max_capacity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_slot (slot_date, slot_time),
    CONSTRAINT chk_capacity CHECK (booked_count <= max_capacity)
);

-- IMPORTANT: The student with id=1 is used for admin login.
-- The admin credentials are the fullname and student_number of the student with id=1.
-- Example admin user (change as needed):
INSERT INTO students (id, fullname, student_number, email, id_reason, data_privacy_agreed, schedule_date, schedule_time, status)
VALUES (1, 'admin', '1234512345', 'admin@tsu.edu.ph', 're_id', TRUE, NULL, NULL, 'done');

-- Create indexes for better performance
CREATE INDEX idx_student_number ON students(student_number);
CREATE INDEX idx_student_email ON students(email);
CREATE INDEX idx_student_fullname ON students(fullname);
CREATE INDEX idx_student_status ON students(status);
CREATE INDEX idx_student_schedule_date ON students(schedule_date);
CREATE INDEX idx_student_schedule_time ON students(schedule_time);
CREATE INDEX idx_student_schedule ON students(schedule_date, schedule_time);
CREATE INDEX idx_student_status_date ON students(status, schedule_date);
CREATE INDEX idx_slot_date ON slots(slot_date);
CREATE INDEX idx_slot_time ON slots(slot_time);
CREATE INDEX idx_slots_capacity ON slots(booked_count, max_capacity);
CREATE INDEX idx_slots_date_time ON slots(slot_date, slot_time);

-- Triggers for automatic booked_count management
DELIMITER //

CREATE TRIGGER update_booked_count_insert
AFTER INSERT ON students
FOR EACH ROW
BEGIN
    IF NEW.schedule_date IS NOT NULL AND NEW.schedule_time IS NOT NULL THEN
        INSERT INTO slots (slot_date, slot_time, booked_count, max_capacity)
        VALUES (NEW.schedule_date, NEW.schedule_time, 1, 12)
        ON DUPLICATE KEY UPDATE booked_count = booked_count + 1;
    END IF;
END//

CREATE TRIGGER update_booked_count_update
AFTER UPDATE ON students
FOR EACH ROW
BEGIN
    -- Decrease count for old slot
    IF OLD.schedule_date IS NOT NULL AND OLD.schedule_time IS NOT NULL THEN
        UPDATE slots 
        SET booked_count = GREATEST(0, booked_count - 1) 
        WHERE slot_date = OLD.schedule_date AND slot_time = OLD.schedule_time;
    END IF;
    
    -- Increase count for new slot
    IF NEW.schedule_date IS NOT NULL AND NEW.schedule_time IS NOT NULL THEN
        INSERT INTO slots (slot_date, slot_time, booked_count, max_capacity)
        VALUES (NEW.schedule_date, NEW.schedule_time, 1, 12)
        ON DUPLICATE KEY UPDATE booked_count = booked_count + 1;
    END IF;
END//

CREATE TRIGGER update_booked_count_delete
AFTER DELETE ON students
FOR EACH ROW
BEGIN
    IF OLD.schedule_date IS NOT NULL AND OLD.schedule_time IS NOT NULL THEN
        UPDATE slots 
        SET booked_count = GREATEST(0, booked_count - 1) 
        WHERE slot_date = OLD.schedule_date AND slot_time = OLD.schedule_time;
    END IF;
END//

DELIMITER ;

-- Migration script for existing databases (run this if upgrading from an older version)
-- This script handles the transition from ENUM to VARCHAR for id_reason and ensures email constraints
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS migrate_existing_database()
BEGIN
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
    
    -- Check if id_reason column exists and is ENUM type
    SET @sql = (SELECT COLUMN_TYPE 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'tsuidschedule' 
                AND TABLE_NAME = 'students' 
                AND COLUMN_NAME = 'id_reason');
    
    IF @sql IS NOT NULL AND @sql LIKE '%enum%' THEN
        ALTER TABLE students MODIFY id_reason VARCHAR(100) NOT NULL;
    END IF;
    
    -- Ensure email column has proper constraints
    SET @email_exists = (SELECT COUNT(*) 
                        FROM INFORMATION_SCHEMA.COLUMNS 
                        WHERE TABLE_SCHEMA = 'tsuidschedule' 
                        AND TABLE_NAME = 'students' 
                        AND COLUMN_NAME = 'email');
    
    IF @email_exists = 0 THEN
        ALTER TABLE students ADD COLUMN email VARCHAR(100) UNIQUE;
    END IF;
    
    -- Add email format constraint if it doesn't exist
    SET @constraint_exists = (SELECT COUNT(*) 
                             FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                             WHERE TABLE_SCHEMA = 'tsuidschedule' 
                             AND TABLE_NAME = 'students' 
                             AND CONSTRAINT_NAME = 'chk_email_format');
    
    IF @constraint_exists = 0 THEN
        ALTER TABLE students ADD CONSTRAINT chk_email_format 
        CHECK (email IS NULL OR email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    END IF;
    
END//

DELIMITER ;

-- Run migration if needed
CALL migrate_existing_database();
DROP PROCEDURE IF EXISTS migrate_existing_database;