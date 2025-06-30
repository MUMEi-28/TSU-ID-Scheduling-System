<?php
include_once __DIR__ . '/../config.php';
include_once __DIR__ . '/../utils.php';
// Simple test for register.php endpoint
$url = 'http://localhost/Projects/TSU-ID-Scheduling-System/backend/register.php';
$uniqueId = time(); // Generate unique identifier
$data = [
    'fullname' => 'Test User',
    'student_number' => strval(1000000000 + ($uniqueId % 9000000000)), // 10 digits, unique
    'email' => 'testuser' . $uniqueId . '@example.com',
    'id_reason' => 're_id',
    'data_privacy_agreed' => true,
    'schedule_time' => '8:00am - 9:00am',
    'schedule_date' => 'June 25, 2025'
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
echo "Register endpoint response:\n";
echo $result;
flush();
ob_flush();
echo "\n"; 