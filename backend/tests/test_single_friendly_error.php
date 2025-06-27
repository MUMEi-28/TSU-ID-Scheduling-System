<?php
// Test single student-friendly error message
$url = 'http://localhost/Projects/TSU-ID-Scheduling-System/backend/login.php';

echo "=== Testing Student-Friendly Error Message ===\n";

$data = ['fullname' => 'Test User', 'student_number' => '12345'];
$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
    ],
];
$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === false) {
    echo "Error: ";
    print_r(error_get_last());
} else {
    $response = json_decode($result, true);
    echo "Status: " . ($response['status'] ?? 'No status') . "\n";
    echo "Message: " . ($response['message'] ?? 'No message') . "\n";
    
    if ($response['status'] === 0 && strpos($response['message'], 'Your student number should be exactly 10 digits') !== false) {
        echo "✅ PASS: Student-friendly message received!\n";
    } else {
        echo "❌ FAIL: Expected student-friendly message\n";
    }
} 