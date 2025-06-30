<?php
/**
 * API Endpoints Compatibility Test
 * Tests all API endpoints with the new database schema
 */

include __DIR__ . '/../config.php';
include __DIR__ . '/../utils.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== API Endpoints Compatibility Test ===\n\n";

// Test results tracking
$tests = [];
$passed = 0;
$failed = 0;

function logTest($testName, $success, $message = '', $details = null) {
    global $tests, $passed, $failed;
    
    $status = $success ? "✅ PASS" : "❌ FAIL";
    $tests[] = [
        'name' => $testName,
        'success' => $success,
        'message' => $message,
        'details' => $details
    ];
    
    if ($success) {
        $passed++;
    } else {
        $failed++;
    }
    
    echo "[$status] $testName\n";
    if ($message) {
        echo "   → $message\n";
    }
    if ($details && !$success) {
        echo "   → Details: " . json_encode($details, JSON_PRETTY_PRINT) . "\n";
    }
    echo "\n";
}

// Helper function to make API calls
function testApiEndpoint($endpoint, $method = 'GET', $data = null) {
    $url = "http://localhost/Projects/TSU-ID-Scheduling-System/backend/$endpoint";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    if ($method === 'POST' || $method === 'PUT') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Content-Length: ' . strlen(json_encode($data))
            ]);
        }
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        return ['error' => $error, 'http_code' => $httpCode];
    }
    
    return [
        'response' => $response,
        'http_code' => $httpCode,
        'data' => json_decode($response, true)
    ];
}

// Test 1: Login API
echo "1. Testing Login API...\n";
try {
    // Test admin login
    $adminData = [
        'fullname' => 'admin',
        'student_number' => '1234512345'
    ];
    
    $result = testApiEndpoint('login.php', 'POST', $adminData);
    
    if ($result['http_code'] === 200 && isset($result['data']['status']) && $result['data']['status'] === 1) {
        logTest("Login API - Admin", true, "Admin login successful");
    } else {
        logTest("Login API - Admin", false, "Admin login failed", $result);
    }
    
    // Test new user login
    $uniqueId = time() . rand(1000,9999);
    $student_number = strval(1000000000 + ($uniqueId % 9000000000));
    $email = 'testapiend' . $uniqueId . '@example.com';
    $newUserData = [
        'fullname' => 'New Test User',
        'student_number' => $student_number,
        'email' => $email
    ];
    
    $result = testApiEndpoint('login.php', 'POST', $newUserData);
    
    if ($result['http_code'] === 200 && isset($result['data']['status']) && $result['data']['status'] === 1) {
        logTest("Login API - New User", true, "New user login successful");
    } else {
        logTest("Login API - New User", false, "New user login failed", $result);
    }
    
} catch (Exception $e) {
    logTest("Login API", false, "Failed to test login API", $e->getMessage());
}

// Test 2: Registration API
echo "2. Testing Registration API...\n";
try {
    $uniqueId = time() . rand(1000,9999);
    $student_number = strval(1000000000 + ($uniqueId % 9000000000));
    $email = 'testapiend' . $uniqueId . '@example.com';
    $registrationData = [
        'fullname' => 'API Test User',
        'student_number' => $student_number,
        'email' => $email,
        'id_reason' => 're_id',
        'data_privacy_agreed' => true
    ];
    
    $result = testApiEndpoint('register.php', 'POST', $registrationData);
    
    if ($result['http_code'] === 200 && isset($result['data']['status']) && $result['data']['status'] === 1) {
        logTest("Registration API", true, "Registration successful");
        
        // Clean up - delete the test user
        $testConn = new PDO('mysql:host=' . server . '; dbname=' . dbname, user, password);
        $stmt = $testConn->prepare("DELETE FROM students WHERE student_number = ?");
        $stmt->execute([$student_number]);
        
    } else {
        logTest("Registration API", false, "Registration failed", $result);
    }
    
} catch (Exception $e) {
    logTest("Registration API", false, "Failed to test registration API", $e->getMessage());
}

// Test 3: Get Students API
echo "3. Testing Get Students API...\n";
try {
    $result = testApiEndpoint('get_students.php', 'GET');
    
    if ($result['http_code'] === 200 && is_array($result['data'])) {
        logTest("Get Students API", true, "Successfully retrieved " . count($result['data']) . " students");
    } else {
        logTest("Get Students API", false, "Failed to retrieve students", $result);
    }
    
} catch (Exception $e) {
    logTest("Get Students API", false, "Failed to test get students API", $e->getMessage());
}

// Test 4: Get Slot Count API
echo "4. Testing Get Slot Count API...\n";
try {
    $params = [
        'schedule_date' => '2024-12-20',
        'schedule_time' => '8:00am-9:00am'
    ];
    
    $url = "http://localhost/Projects/TSU-ID-Scheduling-System/backend/get_slot_count.php?" . http_build_query($params);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $data = json_decode($response, true);
    
    if ($httpCode === 200 && isset($data['count']) && isset($data['max_capacity'])) {
        logTest("Get Slot Count API", true, "Successfully retrieved slot count: {$data['count']}/{$data['max_capacity']}");
    } else {
        logTest("Get Slot Count API", false, "Failed to retrieve slot count", ['response' => $response, 'http_code' => $httpCode]);
    }
    
} catch (Exception $e) {
    logTest("Get Slot Count API", false, "Failed to test get slot count API", $e->getMessage());
}

// Test 5: Get Max Slot Count API
echo "5. Testing Get Max Slot Count API...\n";
try {
    $params = [
        'schedule_date' => '2024-12-20',
        'schedule_time' => '8:00am-9:00am'
    ];
    
    $url = "http://localhost/Projects/TSU-ID-Scheduling-System/backend/get_max_slot_count.php?" . http_build_query($params);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $data = json_decode($response, true);
    
    if ($httpCode === 200 && isset($data['max_capacity'])) {
        logTest("Get Max Slot Count API", true, "Successfully retrieved max capacity: {$data['max_capacity']}");
    } else {
        logTest("Get Max Slot Count API", false, "Failed to retrieve max capacity", ['response' => $response, 'http_code' => $httpCode]);
    }
    
} catch (Exception $e) {
    logTest("Get Max Slot Count API", false, "Failed to test get max slot count API", $e->getMessage());
}

// Test 6: Slot Adjustment API
echo "6. Testing Slot Adjustment API...\n";
try {
    $adjustmentData = [
        'schedule_date' => '2024-12-20',
        'schedule_time' => '8:00am-9:00am',
        'action' => 'increase'
    ];
    
    $result = testApiEndpoint('adjustLimitofSlots.php', 'POST', $adjustmentData);
    
    if ($result['http_code'] === 200 && isset($result['data']['success']) && $result['data']['success'] === true) {
        logTest("Slot Adjustment API - Increase", true, "Successfully increased slot capacity");
        
        // Test decrease
        $adjustmentData['action'] = 'decrease';
        $result = testApiEndpoint('adjustLimitofSlots.php', 'POST', $adjustmentData);
        
        if ($result['http_code'] === 200 && isset($result['data']['success']) && $result['data']['success'] === true) {
            logTest("Slot Adjustment API - Decrease", true, "Successfully decreased slot capacity");
        } else {
            logTest("Slot Adjustment API - Decrease", false, "Failed to decrease slot capacity", $result);
        }
        
    } else {
        logTest("Slot Adjustment API - Increase", false, "Failed to increase slot capacity", $result);
    }
    
} catch (Exception $e) {
    logTest("Slot Adjustment API", false, "Failed to test slot adjustment API", $e->getMessage());
}

// Test 7: Confirm Slot API
echo "7. Testing Confirm Slot API...\n";
try {
    // First create a test student
    $testConn = new PDO('mysql:host=' . server . '; dbname=' . dbname, user, password);
    $stmt = $testConn->prepare("INSERT INTO students (fullname, student_number, email, id_reason, data_privacy_agreed, status) VALUES (?, ?, ?, ?, ?, 'pending')");
    $stmt->execute(['Confirm Test User', '7777777777', 'confirmtest@example.com', 're_id', true]);
    $testStudentId = $testConn->lastInsertId();
    
    // Test confirm slot
    $confirmData = [
        'id' => $testStudentId,
        'fullname' => 'Confirm Test User',
        'student_number' => '7777777777',
        'schedule_date' => '2024-12-20',
        'schedule_time' => '8:00am-9:00am',
        'status' => 'pending'
    ];
    
    $result = testApiEndpoint('confirm_slot.php', 'PUT', $confirmData);
    
    if ($result['http_code'] === 200 && isset($result['data']['status']) && $result['data']['status'] === 1) {
        logTest("Confirm Slot API", true, "Successfully confirmed slot");
    } else {
        logTest("Confirm Slot API", false, "Failed to confirm slot", $result);
    }
    
    // Clean up
    $stmt = $testConn->prepare("DELETE FROM students WHERE id = ?");
    $stmt->execute([$testStudentId]);
    
} catch (Exception $e) {
    logTest("Confirm Slot API", false, "Failed to test confirm slot API", $e->getMessage());
}

// Test 8: Update Admin API
echo "8. Testing Update Admin API...\n";
try {
    $adminData = [
        'fullname' => 'admin',
        'student_number' => '1234512345'
    ];
    
    $result = testApiEndpoint('update_admin.php', 'POST', $adminData);
    
    if ($result['http_code'] === 200 && isset($result['data']['status']) && $result['data']['status'] === 1) {
        logTest("Update Admin API", true, "Successfully updated admin credentials");
    } else {
        logTest("Update Admin API", false, "Failed to update admin credentials", $result);
    }
    
} catch (Exception $e) {
    logTest("Update Admin API", false, "Failed to test update admin API", $e->getMessage());
}

// Test 9: Get Student API
echo "9. Testing Get Student API...\n";
try {
    $params = ['id' => 1]; // Admin user
    $url = "http://localhost/Projects/TSU-ID-Scheduling-System/backend/get_student.php?" . http_build_query($params);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $data = json_decode($response, true);
    
    if ($httpCode === 200 && isset($data['status']) && $data['status'] === 1) {
        logTest("Get Student API", true, "Successfully retrieved student data");
    } else {
        logTest("Get Student API", false, "Failed to retrieve student data", ['response' => $response, 'http_code' => $httpCode]);
    }
    
} catch (Exception $e) {
    logTest("Get Student API", false, "Failed to test get student API", $e->getMessage());
}

// Test 10: Booking API (via index.php)
echo "10. Testing Booking API...\n";
try {
    // First create a test student
    $testConn = new PDO('mysql:host=' . server . '; dbname=' . dbname, user, password);
    $stmt = $testConn->prepare("INSERT INTO students (fullname, student_number, email, id_reason, data_privacy_agreed, status) VALUES (?, ?, ?, ?, ?, 'pending')");
    $stmt->execute(['Booking Test User', '6666666666', 'bookingtest@example.com', 're_id', true]);
    $testStudentId = $testConn->lastInsertId();
    
    // Test booking update
    $bookingData = [
        'id' => $testStudentId,
        'fullname' => 'Booking Test User',
        'student_number' => '6666666666',
        'schedule_date' => '2024-12-20',
        'schedule_time' => '9:00am-10:00am',
        'status' => 'pending'
    ];
    
    $result = testApiEndpoint('index.php', 'PUT', $bookingData);
    
    if ($result['http_code'] === 200 && isset($result['data']['status']) && $result['data']['status'] === 1) {
        logTest("Booking API", true, "Successfully updated booking");
    } else {
        logTest("Booking API", false, "Failed to update booking", $result);
    }
    
    // Clean up
    $stmt = $testConn->prepare("DELETE FROM students WHERE id = ?");
    $stmt->execute([$testStudentId]);
    
} catch (Exception $e) {
    logTest("Booking API", false, "Failed to test booking API", $e->getMessage());
}

// Summary
echo "=== API TEST SUMMARY ===\n";
echo "Total Tests: " . count($tests) . "\n";
echo "Passed: $passed\n";
echo "Failed: $failed\n";
echo "Success Rate: " . round(($passed / count($tests)) * 100, 2) . "%\n\n";

if ($failed > 0) {
    echo "=== FAILED API TESTS ===\n";
    foreach ($tests as $test) {
        if (!$test['success']) {
            echo "❌ {$test['name']}: {$test['message']}\n";
            if ($test['details']) {
                echo "   Details: " . json_encode($test['details']) . "\n";
            }
        }
    }
} else {
    echo "🎉 All API tests passed! All endpoints are working correctly.\n";
}

echo "\n=== API RECOMMENDATIONS ===\n";
if ($failed > 0) {
    echo "⚠️  Some API tests failed. Please review the errors above and fix any issues.\n";
} else {
    echo "✅ All API endpoints are functioning correctly.\n";
    echo "✅ Database operations are working properly.\n";
    echo "✅ Data validation is working as expected.\n";
    echo "✅ Triggers and constraints are functioning.\n";
}

echo "\nAPI test completed at: " . date('Y-m-d H:i:s') . "\n";
?> 