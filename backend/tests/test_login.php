<?php
// Simple test for login.php endpoint
$url = 'http://localhost/Projects/TSU-ID-Scheduling-System/backend/login.php';
$data = [
    'fullname' => 'Test User',
    'student_number' => '2022999999'
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
echo "Login endpoint response:\n";
echo $result; 