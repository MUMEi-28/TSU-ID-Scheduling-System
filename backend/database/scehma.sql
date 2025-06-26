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