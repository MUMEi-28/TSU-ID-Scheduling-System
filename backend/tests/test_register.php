<?php
// Simple test for register.php endpoint
$url = 'http://localhost/Projects/TSU-ID-Scheduling-System/backend/register.php';
$data = [
    'fullname' => 'Test User',
    'student_number' => '2022999999',
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