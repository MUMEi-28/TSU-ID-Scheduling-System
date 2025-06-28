CREATE DATABASE tsuidschedule;

USE tsuidschedule;

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100),
    student_number VARCHAR(30),
    email VARCHAR(100),
    id_reason ENUM('Re-ID', 'Lost ID', 'Masters/Doctors/School of Law') NOT NULL,
    data_privacy_agreed BOOLEAN DEFAULT FALSE,
    schedule_date VARCHAR(30),
    schedule_time VARCHAR(30),
    status VARCHAR(20) DEFAULT 'pending'
);

CREATE TABLE slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slot_date DATE,
    slot_time VARCHAR(10),
    booked_count INT DEFAULT 0
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