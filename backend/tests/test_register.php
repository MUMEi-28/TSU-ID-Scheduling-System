<?php
include_once __DIR__ . '/../config.php';
include_once __DIR__ . '/../utils.php';
// Simple test for register.php endpoint
$url = 'http://localhost/Projects/TSU-ID-Scheduling-System/backend/register.php';
$uniqueId = time(); // Generate unique identifier

// Test: Registration with schedule fields (should succeed)
$data = [
    'fullname' => 'Test User',
    'student_number' => strval(1000000000 + ($uniqueId % 9000000000)), // 10 digits, unique
    'email' => 'testuser' . $uniqueId . '@example.com',
    'id_reason' => 're_id',
    'data_privacy_agreed' => true,
    'schedule_date' => '2025-06-25', // New date format (YYYY-MM-DD)
    'schedule_time' => '08:00', // New time format (HH:MM)
    'status' => 'pending' // New status field
];
$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
    ],
];
$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);
echo "Register endpoint response (with schedule):\n";
echo $result;
flush();
ob_flush();
echo "\n";

// Test: Registration without schedule fields (should succeed)
$data2 = [
    'fullname' => 'Test User 2',
    'student_number' => strval(2000000000 + ($uniqueId % 8000000000)), // 10 digits, unique
    'email' => 'testuser2_' . $uniqueId . '@example.com',
    'id_reason' => 'lost_id',
    'data_privacy_agreed' => true
    // No schedule_date, schedule_time, or status
];
$options2 = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data2),
    ],
];
$context2  = stream_context_create($options2);
$result2 = file_get_contents($url, false, $context2);
echo "Register endpoint response (without schedule):\n";
echo $result2;
flush();
ob_flush();
echo "\n"; 