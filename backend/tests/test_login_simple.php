<?php
// Simple test for login.php endpoint - key validation scenarios
$url = 'http://localhost/Projects/TSU-ID-Scheduling-System/backend/login.php';

function testLogin($testName, $data) {
    global $url;
    echo "=== $testName ===\n";
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
        echo "Response: " . $result . "\n";
    }
    echo "\n";
}

// Test 1: Admin login (should succeed)
testLogin("Admin Login", [
    'fullname' => 'admin',
    'student_number' => '1234512345'
]);

// Test 2: Invalid student number format (should fail)
testLogin("Invalid Student Number", [
    'fullname' => 'Test User',
    'student_number' => '12345'
]);

// Test 3: Non-existent user (should fail)
testLogin("Non-existent User", [
    'fullname' => 'Test User',
    'student_number' => '2022999999'
]);

echo "Login validation tests completed!\n"; 