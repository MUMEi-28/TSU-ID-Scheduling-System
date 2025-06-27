<?php
// Test student-friendly error messages
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
            echo "✅ PASS: Student-friendly message received\n";
        } else {
            echo "❌ FAIL: Message not as expected\n";
        }
    }
    echo "\n";
}

// Test various student-friendly error scenarios
testError("Invalid Student Number", 
    ['fullname' => 'Test User', 'student_number' => '12345'], 
    'Your student number should be exactly 10 digits'
);

testError("Missing Fullname", 
    ['student_number' => '2022999999'], 
    'Please enter your full name'
);

testError("Missing Student Number", 
    ['fullname' => 'Test User'], 
    'Please enter your student number'
);

testError("Non-existent User", 
    ['fullname' => 'Test User', 'student_number' => '2022999999'], 
    'We couldn\'t find your account'
);

echo "Student-friendly error message tests completed!\n"; 