CREATE DATABASE tsuidschedule;

USE tsuidschedule;

-- MIGRATION NOTE: id_reason is now VARCHAR(100) instead of ENUM for flexibility (2024-06-09)
-- If upgrading, run: ALTER TABLE students MODIFY id_reason VARCHAR(100) NOT NULL;

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100),
    student_number VARCHAR(30),
    email VARCHAR(100),
    id_reason VARCHAR(100) NOT NULL,
    data_privacy_agreed BOOLEAN DEFAULT FALSE,
    schedule_date VARCHAR(30),
    schedule_time VARCHAR(30),
    status VARCHAR(20) DEFAULT 'pending'
);

CREATE TABLE slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slot_date DATE,
    -- CANONICAL FORMAT: slot_time should always be in the format '8:00am-9:00am', '9:00am-10:00am', etc. (no spaces, lowercase am/pm)
    -- Use normalize_slot_time() function in PHP or normalizeSlotTime() in JS before any DB operations
    slot_time VARCHAR(20),
    booked_count INT DEFAULT 0,
    max_capacity INT DEFAULT 12,
    UNIQUE KEY unique_slot (slot_date, slot_time)
);

-- IMPORTANT: The student with id=1 is used for admin login.
-- The admin credentials are the fullname and student_number of the student with id=1.
-- Example admin user (change as needed):
INSERT INTO students (id, fullname, student_number, email, id_reason, data_privacy_agreed, schedule_date, schedule_time)
VALUES (1, 'admin', '1234512345', 'admin@tsu.edu.ph', 're_id', TRUE, NULL, NULL);


-- Create indexes for better performance
CREATE INDEX idx_student_number ON students(student_number);
CREATE INDEX idx_fullname ON students(fullname);
CREATE INDEX idx_status ON students(status);
CREATE INDEX idx_schedule_date ON students(schedule_date);
CREATE INDEX idx_schedule_time ON students(schedule_time);
CREATE INDEX idx_slot_date ON slots(slot_date);
CREATE INDEX idx_slot_time ON slots(slot_time);