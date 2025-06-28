<?php
// Test to verify frontend error messages
$url = 'http://localhost/Projects/TSU-ID-Scheduling-System/backend/login.php';

function testError($testName, $data, $expectedError) {
    global $url;
    echo "=== $testName ===\n";
    echo "Expected: $expectedError\n";
    
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
        echo "Received: " . ($response['message'] ?? 'No message') . "\n";
        echo "Status: " . ($response['status'] ?? 'No status') . "\n";
        
        if (strpos($response['message'] ?? '', $expectedError) !== false) {
            echo "✅ PASS: Error message matches expected\n";
        } else {
            echo "❌ FAIL: Error message does not match expected\n";
        }
    }
    echo "\n";
}

// Test various error scenarios
testError("Invalid Student Number", 
    ['fullname' => 'Test User', 'student_number' => '12345'], 
    'Invalid student number format'
);

testError("Missing Fullname", 
    ['student_number' => '2022999999'], 
    'Full name is required'
);

testError("Missing Student Number", 
    ['fullname' => 'Test User'], 
    'Student number is required'
);

testError("Non-existent User", 
    ['fullname' => 'Test User', 'student_number' => '2022999999'], 
    'No matching user found'
);

echo "Frontend error message tests completed!\n"; 