CREATE DATABASE tsuidschedule;

USE tsuidschedule;


CREATE TABLE students (
id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100),
    student_number VARCHAR(30),
    schedule_date VARCHAR(30),
    schedule_time VARCHAR(30)
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
INSERT INTO students (id, fullname, student_number, schedule_date, schedule_time)
VALUES (1, 'admin', '1234512345', NULL, NULL);