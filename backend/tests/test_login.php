<?php
// Comprehensive test for login.php endpoint
echo "Starting login tests...\n";
$url = 'http://localhost/Projects/TSU-ID-Scheduling-System/backend/login.php';

function testLogin($testName, $data) {
    global $url;
    echo "=== $testName ===\n";
    echo "Sending data: " . json_encode($data) . "\n";
    $options = [
        'http' => [
            'header'  => "Content-type: application/json\r\n",
            'method'  => 'POST',
            'content' => json_encode($data),
        ],
    ];
    $context = stream_context_create($options);
    echo "Making request to: $url\n";
    $result = file_get_contents($url, false, $context);
    if ($result === false) {
        echo "Error in $testName: ";
        print_r(error_get_last());
    } else {
        echo "Response:\n";
        echo $result . "\n";
    }
    echo "\n";
}

// Test 1: Admin credentials
testLogin("Test 1: Admin Login", [
    'fullname' => 'admin',
    'student_number' => '1234512345'
]);

// Test 2: Invalid student number format (not 10 digits)
testLogin("Test 2: Invalid Student Number Format", [
    'fullname' => 'Test User',
    'student_number' => '12345'
]);

// Test 3: Missing fullname
testLogin("Test 3: Missing Fullname", [
    'student_number' => '2022999999'
]);

// Test 4: Missing student number
testLogin("Test 4: Missing Student Number", [
    'fullname' => 'Test User'
]);

// Test 5: Non-existent user
testLogin("Test 5: Non-existent User", [
    'fullname' => 'Test User',
    'student_number' => '2022999999'
]);

// Test 6: Invalid JSON (malformed data)
echo "=== Test 6: Invalid JSON ===\n";
$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => '{"invalid": json}',
    ],
];
$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);
if ($result === false) {
    echo "Error in invalid JSON test: ";
    print_r(error_get_last());
} else {
    echo "Response:\n";
    echo $result . "\n";
}

echo "Tests completed.\n"; 