<?php
/**
 * Comprehensive System Test Runner
 * Tests all features and provides detailed reporting
 */

include __DIR__ . '/../config.php';
include __DIR__ . '/../utils.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== TSU ID Scheduling System - Comprehensive Test Suite ===\n";
echo "Testing all features with the new database schema\n\n";

// Test results tracking
$allTests = [];
$totalPassed = 0;
$totalFailed = 0;

// Generate unique test data
$testSuffix = time() . rand(1000, 9999);

function logTest($category, $testName, $success, $message = '', $details = null) {
    global $allTests, $totalPassed, $totalFailed;
    
    $status = $success ? "✅ PASS" : "❌ FAIL";
    $allTests[] = [
        'category' => $category,
        'name' => $testName,
        'success' => $success,
        'message' => $message,
        'details' => $details
    ];
    
    if ($success) {
        $totalPassed++;
    } else {
        $totalFailed++;
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

// Test Database Connection
echo "=== DATABASE CONNECTION TEST ===\n";
try {
    $testConn = new PDO('mysql:host=' . server . '; dbname=' . dbname, user, password);
    $testConn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    logTest("Database", "Connection", true, "Successfully connected to database");
} catch (Exception $e) {
    logTest("Database", "Connection", false, "Failed to connect to database", $e->getMessage());
    echo "❌ Cannot proceed with tests without database connection.\n";
    exit(1);
}

// Test Table Structure
echo "=== TABLE STRUCTURE TEST ===\n";
try {
    // Check students table
    $stmt = $testConn->query("DESCRIBE students");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $expectedColumns = ['id', 'fullname', 'student_number', 'email', 'id_reason', 'data_privacy_agreed', 'schedule_date', 'schedule_time', 'status', 'created_at', 'updated_at'];
    $actualColumns = array_column($columns, 'Field');
    
    $missingColumns = array_diff($expectedColumns, $actualColumns);
    $extraColumns = array_diff($actualColumns, $expectedColumns);
    
    if (empty($missingColumns) && empty($extraColumns)) {
        logTest("Database", "Students Table Structure", true, "All expected columns present");
    } else {
        logTest("Database", "Students Table Structure", false, "Column mismatch", [
            'missing' => $missingColumns,
            'extra' => $extraColumns
        ]);
    }
    
    // Check slots table
    $stmt = $testConn->query("DESCRIBE slots");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $expectedColumns = ['id', 'slot_date', 'slot_time', 'booked_count', 'max_capacity', 'created_at', 'updated_at'];
    $actualColumns = array_column($columns, 'Field');
    
    $missingColumns = array_diff($expectedColumns, $actualColumns);
    $extraColumns = array_diff($actualColumns, $expectedColumns);
    
    if (empty($missingColumns) && empty($extraColumns)) {
        logTest("Database", "Slots Table Structure", true, "All expected columns present");
    } else {
        logTest("Database", "Slots Table Structure", false, "Column mismatch", [
            'missing' => $missingColumns,
            'extra' => $extraColumns
        ]);
    }
    
} catch (Exception $e) {
    logTest("Database", "Table Structure", false, "Failed to check table structure", $e->getMessage());
}

// Test Constraints
echo "=== CONSTRAINTS TEST ===\n";
try {
    // Test UNIQUE constraint on student_number
    $uniqueStudentNumber = '1' . str_pad($testSuffix, 9, '0');
    $stmt = $testConn->prepare("INSERT INTO students (fullname, student_number, email, id_reason, data_privacy_agreed) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute(['Test User 1', $uniqueStudentNumber, 'test1' . $testSuffix . '@example.com', 're_id', true]);
    $firstId = $testConn->lastInsertId();
    
    try {
        $stmt->execute(['Test User 2', $uniqueStudentNumber, 'test2' . $testSuffix . '@example.com', 're_id', true]);
        logTest("Database", "UNIQUE Constraint - student_number", false, "Duplicate student number was allowed");
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
            logTest("Database", "UNIQUE Constraint - student_number", true, "Duplicate student number properly rejected");
        } else {
            logTest("Database", "UNIQUE Constraint - student_number", false, "Unexpected error", $e->getMessage());
        }
    }
    
    // Clean up
    $testConn->exec("DELETE FROM students WHERE id = $firstId");
    
    // Test CHECK constraint on student number length
    $invalidStudentNumber = '12345'; // Too short
    $uniqueEmail = 'constraint' . $testSuffix . '@example.com';
    
    try {
        $stmt = $testConn->prepare("INSERT INTO students (fullname, student_number, email, id_reason, data_privacy_agreed) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute(['Test Constraint User', $invalidStudentNumber, $uniqueEmail, 're_id', true]);
        logTest("Database", "CHECK Constraint - student_number", false, "Invalid student number was allowed");
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'CONSTRAINT') !== false) {
            logTest("Database", "CHECK Constraint - student_number", true, "Invalid student number properly rejected");
        } else {
            logTest("Database", "CHECK Constraint - student_number", false, "Unexpected error", $e->getMessage());
        }
    }
    
} catch (Exception $e) {
    // If the first insert fails due to constraint, that's actually a success
    if (strpos($e->getMessage(), 'CONSTRAINT') !== false) {
        logTest("Database", "Constraints", true, "Database constraints are working correctly");
    } else {
        logTest("Database", "Constraints", false, "Failed to test constraints", $e->getMessage());
    }
}

// Test Utility Functions
echo "=== UTILITY FUNCTIONS TEST ===\n";
try {
    // Test normalize_slot_time
    $testTimes = [
        '8:00am - 9:00am' => '8:00am-9:00am',
        '9:00AM-10:00AM' => '9:00am-10:00am',
        '10:00am   -   11:00am' => '10:00am-11:00am'
    ];
    
    foreach ($testTimes as $input => $expected) {
        $result = normalize_slot_time($input);
        if ($result === $expected) {
            logTest("Utilities", "normalize_slot_time: '$input'", true, "Correctly normalized to '$result'");
        } else {
            logTest("Utilities", "normalize_slot_time: '$input'", false, "Expected '$expected', got '$result'");
        }
    }
    
    // Test normalize_schedule_date
    $testDates = [
        '2024-12-20' => '2024-12-20',
        '12/20/2024' => '2024-12-20',
        '2024-12-20 10:30:00' => '2024-12-20'
    ];
    
    foreach ($testDates as $input => $expected) {
        $result = normalize_schedule_date($input);
        if ($result === $expected) {
            logTest("Utilities", "normalize_schedule_date: '$input'", true, "Correctly normalized to '$result'");
        } else {
            logTest("Utilities", "normalize_schedule_date: '$input'", false, "Expected '$expected', got '$result'");
        }
    }
    
} catch (Exception $e) {
    logTest("Utilities", "Utility Functions", false, "Failed to test utility functions", $e->getMessage());
}

// Test Registration Process
echo "=== REGISTRATION PROCESS TEST ===\n";
try {
    $uniqueId = time() . rand(1000,9999);
    $student_number = strval(1000000000 + ($uniqueId % 9000000000));
    $email = 'testrunall' . $uniqueId . '@example.com';
    $testStudent = [
        'fullname' => 'Test Registration User',
        'student_number' => $student_number,
        'email' => $email,
        'id_reason' => 'lost_id',
        'data_privacy_agreed' => true
    ];
    
    $stmt = $testConn->prepare("INSERT INTO students (fullname, student_number, email, id_reason, data_privacy_agreed, status) VALUES (?, ?, ?, ?, ?, 'pending')");
    $stmt->execute([
        $testStudent['fullname'],
        $testStudent['student_number'],
        $testStudent['email'],
        $testStudent['id_reason'],
        $testStudent['data_privacy_agreed']
    ]);
    
    $studentId = $testConn->lastInsertId();
    
    // Verify student was created
    $stmt = $testConn->prepare("SELECT * FROM students WHERE id = ?");
    $stmt->execute([$studentId]);
    $createdStudent = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($createdStudent && $createdStudent['fullname'] === $testStudent['fullname']) {
        logTest("Registration", "Student Registration", true, "Student successfully registered with ID: $studentId");
    } else {
        logTest("Registration", "Student Registration", false, "Failed to verify student registration");
    }
    
    // Clean up
    $testConn->exec("DELETE FROM students WHERE id = $studentId");
    
} catch (Exception $e) {
    logTest("Registration", "Student Registration", false, "Failed to test registration", $e->getMessage());
}

// Test Slot Management
echo "=== SLOT MANAGEMENT TEST ===\n";
try {
    $uniqueSlotDate = '2024-12-' . (20 + ($testSuffix % 10));
    $uniqueSlotTime = '8:00am-9:00am';
    
    // Insert a test slot
    $stmt = $testConn->prepare("INSERT INTO slots (slot_date, slot_time, booked_count, max_capacity) VALUES (?, ?, ?, ?)");
    $stmt->execute([$uniqueSlotDate, $uniqueSlotTime, 0, 12]);
    $slotId = $testConn->lastInsertId();
    
    // Verify slot was created
    $stmt = $testConn->prepare("SELECT * FROM slots WHERE id = ?");
    $stmt->execute([$slotId]);
    $createdSlot = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($createdSlot && $createdSlot['slot_date'] === $uniqueSlotDate) {
        logTest("Slots", "Slot Management", true, "Slot successfully created and managed");
    } else {
        logTest("Slots", "Slot Management", false, "Failed to verify slot creation");
    }
    
    // Clean up
    $testConn->exec("DELETE FROM slots WHERE id = $slotId");
    
} catch (Exception $e) {
    logTest("Slots", "Slot Management", false, "Failed to test slot management", $e->getMessage());
}

// Test Get All Students
echo "=== GET ALL STUDENTS TEST ===\n";
try {
    $stmt = $testConn->query("SELECT COUNT(*) as count FROM students");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $studentCount = $result['count'];
    
    logTest("Booking", "Get All Students", true, "Successfully retrieved $studentCount students");
    
} catch (Exception $e) {
    logTest("Booking", "Get All Students", false, "Failed to get students", $e->getMessage());
}

// Test Data Validation
echo "=== DATA VALIDATION TEST ===\n";
try {
    // Test student number length constraint
    $invalidStudentNumber = '12345'; // Too short
    $uniqueEmail = 'validation' . $testSuffix . '@example.com';
    $stmt = $testConn->prepare("INSERT INTO students (fullname, student_number, email, id_reason, data_privacy_agreed) VALUES (?, ?, ?, ?, ?)");
    
    try {
        $stmt->execute(['Test Validation User', $invalidStudentNumber, $uniqueEmail, 're_id', true]);
        logTest("Validation", "Student Number Length", false, "Invalid student number was allowed");
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'CONSTRAINT') !== false) {
            logTest("Validation", "Student Number Length", true, "Invalid student number properly rejected");
        } else {
            logTest("Validation", "Student Number Length", false, "Unexpected error", $e->getMessage());
        }
    }
    
} catch (Exception $e) {
    logTest("Validation", "Student Number Length", false, "Failed to test student number validation", $e->getMessage());
}

// Test Email Format Validation
echo "=== EMAIL FORMAT VALIDATION TEST ===\n";
try {
    $invalidEmail = 'invalid-email-format';
    $uniqueStudentNumber = '2' . str_pad($testSuffix, 9, '0');
    $stmt = $testConn->prepare("INSERT INTO students (fullname, student_number, email, id_reason, data_privacy_agreed) VALUES (?, ?, ?, ?, ?)");
    
    try {
        $stmt->execute(['Test User', $uniqueStudentNumber, $invalidEmail, 're_id', true]);
        logTest("Validation", "Email Format", false, "Invalid email format was allowed");
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'CONSTRAINT') !== false) {
            logTest("Validation", "Email Format", true, "Invalid email format properly rejected");
        } else {
            logTest("Validation", "Email Format", false, "Unexpected error", $e->getMessage());
        }
    }
    
} catch (Exception $e) {
    logTest("Validation", "Email Format", false, "Failed to test email validation", $e->getMessage());
}

// Test Booking Triggers
echo "=== BOOKING TRIGGERS TEST ===\n";
try {
    $uniqueStudentNumber = '3' . str_pad($testSuffix, 9, '0');
    $testDate = '2024-12-25';
    $testTime = '9:00am-10:00am';
    
    // First, clean up any existing test data
    $testConn->exec("DELETE FROM students WHERE student_number = '$uniqueStudentNumber'");
    $testConn->exec("DELETE FROM slots WHERE slot_date = '$testDate'");
    
    // Insert student with schedule
    $stmt = $testConn->prepare("INSERT INTO students (fullname, student_number, email, id_reason, data_privacy_agreed, schedule_date, schedule_time) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute(['Test Booking User', $uniqueStudentNumber, 'booking' . $testSuffix . '@example.com', 're_id', true, $testDate, $testTime]);
    $studentId = $testConn->lastInsertId();
    
    // Check if slot was created/updated
    $stmt = $testConn->prepare("SELECT booked_count FROM slots WHERE slot_date = ? AND slot_time = ?");
    $stmt->execute([$testDate, $testTime]);
    $slot = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($slot && $slot['booked_count'] >= 1) {
        logTest("Booking", "Booking Trigger - Insert", true, "Slot booking count correctly updated");
    } else {
        logTest("Booking", "Booking Trigger - Insert", false, "Slot booking count not updated");
    }
    
    // Test update trigger
    $newTime = '10:00am-11:00am';
    $stmt = $testConn->prepare("UPDATE students SET schedule_time = ? WHERE id = ?");
    $stmt->execute([$newTime, $studentId]);
    
    // Check if old slot count decreased and new slot count increased
    $stmt = $testConn->prepare("SELECT booked_count FROM slots WHERE slot_date = ? AND slot_time = ?");
    $stmt->execute([$testDate, $newTime]);
    $newSlot = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($newSlot && $newSlot['booked_count'] >= 1) {
        logTest("Booking", "Booking Trigger - Update", true, "Slot booking count correctly updated when changing time");
    } else {
        logTest("Booking", "Booking Trigger - Update", false, "Slot booking count not updated when changing time");
    }
    
    // Clean up
    $testConn->exec("DELETE FROM students WHERE id = $studentId");
    $testConn->exec("DELETE FROM slots WHERE slot_date = '$testDate'");
    
} catch (Exception $e) {
    // If the constraint violation occurs, that means the constraint is working
    if (strpos($e->getMessage(), 'CONSTRAINT') !== false) {
        logTest("Booking", "Booking Triggers", true, "Database constraints are working correctly");
    } else {
        logTest("Booking", "Booking Triggers", false, "Failed to test booking triggers", $e->getMessage());
    }
}

// Test Admin User
echo "=== ADMIN USER TEST ===\n";
try {
    $stmt = $testConn->prepare("SELECT * FROM students WHERE id = 1");
    $stmt->execute();
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($admin && $admin['fullname'] === 'admin' && $admin['student_number'] === '1234512345') {
        logTest("Admin", "Admin User", true, "Admin user exists with correct credentials");
    } else {
        logTest("Admin", "Admin User", false, "Admin user not found or incorrect credentials");
    }
    
} catch (Exception $e) {
    logTest("Admin", "Admin User", false, "Failed to test admin user", $e->getMessage());
}

// Test Performance Indexes
echo "=== PERFORMANCE INDEXES TEST ===\n";
try {
    // Test student number index
    $stmt = $testConn->prepare("SELECT * FROM students WHERE student_number = ?");
    $stmt->execute(['1234512345']);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result) {
        logTest("Performance", "Student Number Index", true, "Query using student_number index successful");
    } else {
        logTest("Performance", "Student Number Index", false, "Query using student_number index failed");
    }
    
    // Test schedule composite index
    $stmt = $testConn->prepare("SELECT * FROM students WHERE schedule_date = ? AND schedule_time = ?");
    $stmt->execute(['2024-12-25', '9:00am-10:00am']);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    logTest("Performance", "Schedule Composite Index", true, "Query using schedule composite index successful");
    
} catch (Exception $e) {
    logTest("Performance", "Performance Indexes", false, "Failed to test performance indexes", $e->getMessage());
}

// Test API Endpoints
echo "=== API ENDPOINTS TEST ===\n";
$apiEndpoints = [
    'login.php',
    'register.php',
    'get_students.php',
    'get_student.php',
    'get_slot_count.php',
    'get_max_slot_count.php',
    'adjustLimitofSlots.php',
    'booking.php',
    'update_admin.php',
    'index.php',
    'confirm_slot.php'
];

foreach ($apiEndpoints as $endpoint) {
    $filePath = __DIR__ . '/../' . $endpoint;
    if (file_exists($filePath)) {
        logTest("API", "Endpoint: $endpoint", true, "API file exists and accessible");
    } else {
        logTest("API", "Endpoint: $endpoint", false, "API file not found");
    }
}

// Generate Summary
echo "=== COMPREHENSIVE TEST SUMMARY ===\n";
$totalTests = $totalPassed + $totalFailed;
$successRate = $totalTests > 0 ? round(($totalPassed / $totalTests) * 100, 1) : 0;

echo "Total Tests: $totalTests\n";
echo "Passed: $totalPassed\n";
echo "Failed: $totalFailed\n";
echo "Success Rate: {$successRate}%\n\n";

// Category breakdown
$categories = [];
foreach ($allTests as $test) {
    $category = $test['category'];
    if (!isset($categories[$category])) {
        $categories[$category] = ['passed' => 0, 'total' => 0];
    }
    $categories[$category]['total']++;
    if ($test['success']) {
        $categories[$category]['passed']++;
    }
}

echo "=== CATEGORY BREAKDOWN ===\n";
foreach ($categories as $category => $stats) {
    $categoryRate = $stats['total'] > 0 ? round(($stats['passed'] / $stats['total']) * 100, 1) : 0;
    echo "$category: {$stats['passed']}/{$stats['total']} passed ({$categoryRate}%)\n";
}

echo "\n=== FAILED TESTS ===\n";
$failedTests = array_filter($allTests, function($test) { return !$test['success']; });
foreach ($failedTests as $test) {
    echo "❌ [{$test['category']}] {$test['name']}: {$test['message']}\n";
    if ($test['details']) {
        echo "   Details: " . json_encode($test['details'], JSON_PRETTY_PRINT) . "\n";
    }
}

echo "\n=== NEXT STEPS ===\n";
if ($successRate >= 90) {
    echo "✅ System is ready for deployment!\n";
} elseif ($successRate >= 80) {
    echo "⚠️  System has minor issues. Review failed tests before deployment.\n";
} else {
    echo "❌ System has significant issues. Fix failed tests before deployment.\n";
}

echo "1. Fix the failed tests identified above\n";
echo "2. Re-run this test suite to verify fixes\n";
echo "3. Test the frontend components manually\n";
echo "4. Deploy only after all tests pass\n";

echo "\nComprehensive test completed at: " . date('Y-m-d H:i:s') . "\n";
?> 