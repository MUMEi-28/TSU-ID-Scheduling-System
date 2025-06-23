CREATE DATABASE tsuidschedule;

USE tsuidschedule;


CREATE TABLE students (
id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100),
    student_number VARCHAR(20),
    schedule_date DATE,
    schedule_time VARCHAR(10),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending'
    );
    
CREATE TABLE slots (
id INT AUTO_INCREMENT PRIMARY KEY,
    slot_date DATE,
    slot_time VARCHAR(10),
    booked_count INT DEFAULT 0
);