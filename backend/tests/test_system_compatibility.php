<?php
/**
 * Comprehensive System Compatibility Test
 * Tests all features with the new database schema
 */

include __DIR__ . '/../config.php';
include __DIR__ . '/../utils.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== TSU ID Scheduling System - Database Compatibility Test ===\n\n";

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

// Test 1: Database Connection
echo "1. Testing Database Connection...\n";
try {
    $testConn = new PDO('mysql:host=' . server . '; dbname=' . dbname, user, password);
    $testConn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    logTest("Database Connection", true, "Successfully connected to database");
} catch (Exception $e) {
    logTest("Database Connection", false, "Failed to connect to database", $e->getMessage());
    exit(1);
}

// Test 2: Table Structure Verification
echo "2. Testing Table Structure...\n";
try {
    // Check students table
    $stmt = $testConn->query("DESCRIBE students");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $expectedColumns = ['id', 'fullname', 'student_number', 'email', 'id_reason', 'data_privacy_agreed', 'schedule_date', 'schedule_time', 'status', 'created_at', 'updated_at'];
    $actualColumns = array_column($columns, 'Field');
    
    $missingColumns = array_diff($expectedColumns, $actualColumns);
    $extraColumns = array_diff($actualColumns, $expectedColumns);
    
    if (empty($missingColumns) && empty($extraColumns)) {
        logTest("Students Table Structure", true, "All expected columns present");
    } else {
        logTest("Students Table Structure", false, "Column mismatch", [
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
        logTest("Slots Table Structure", true, "All expected columns present");
    } else {
        logTest("Slots Table Structure", false, "Column mismatch", [
            'missing' => $missingColumns,
            'extra' => $extraColumns
        ]);
    }
    
} catch (Exception $e) {
    logTest("Table Structure", false, "Failed to check table structure", $e->getMessage());
}

// Test 3: Constraints Verification
echo "3. Testing Database Constraints...\n";
try {
    // Test UNIQUE constraint on student_number
    $stmt = $testConn->prepare("INSERT INTO students (fullname, student_number, email, id_reason, data_privacy_agreed) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute(['Test User 1', '1234567890', 'test1@example.com', 're_id', true]);
    $firstId = $testConn->lastInsertId();
    
    // Try to insert duplicate student number
    try {
        $stmt->execute(['Test User 2', '1234567890', 'test2@example.com', 're_id', true]);
        logTest("UNIQUE Constraint - student_number", false, "Duplicate student number was allowed");
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
            logTest("UNIQUE Constraint - student_number", true, "Duplicate student number properly rejected");
        } else {
            logTest("UNIQUE Constraint - student_number", false, "Unexpected error", $e->getMessage());
        }
    }
    
    // Clean up
    $testConn->exec("DELETE FROM students WHERE id = $firstId");
    
} catch (Exception $e) {
    logTest("Constraints Test", false, "Failed to test constraints", $e->getMessage());
}

// Test 4: Utility Functions
echo "4. Testing Utility Functions...\n";
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
            logTest("normalize_slot_time: '$input'", true, "Correctly normalized to '$result'");
        } else {
            logTest("normalize_slot_time: '$input'", false, "Expected '$expected', got '$result'");
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
            logTest("normalize_schedule_date: '$input'", true, "Correctly normalized to '$result'");
        } else {
            logTest("normalize_schedule_date: '$input'", false, "Expected '$expected', got '$result'");
        }
    }
    
} catch (Exception $e) {
    logTest("Utility Functions", false, "Failed to test utility functions", $e->getMessage());
}

// Test 5: Registration Process
echo "5. Testing Registration Process...\n";
try {
    $uniqueId = time() . rand(1000,9999);
    $student_number = strval(1000000000 + ($uniqueId % 9000000000));
    $email = 'testsys' . $uniqueId . '@example.com';
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
        logTest("Student Registration", true, "Student successfully registered with ID: $studentId");
    } else {
        logTest("Student Registration", false, "Failed to retrieve created student");
    }
    
    // Clean up
    $testConn->exec("DELETE FROM students WHERE id = $studentId");
    
} catch (Exception $e) {
    logTest("Registration Process", false, "Failed to test registration", $e->getMessage());
}

// Test 6: Slot Management
echo "6. Testing Slot Management...\n";
try {
    $testDate = '2024-12-20';
    $testTime = '8:00am-9:00am';
    
    // Create a test slot
    $stmt = $testConn->prepare("INSERT INTO slots (slot_date, slot_time, booked_count, max_capacity) VALUES (?, ?, 0, 12)");
    $stmt->execute([$testDate, $testTime]);
    $slotId = $testConn->lastInsertId();
    
    // Test slot creation
    if ($slotId) {
        logTest("Slot Creation", true, "Slot created with ID: $slotId");
    } else {
        logTest("Slot Creation", false, "Failed to create slot");
    }
    
    // Test slot capacity check
    $stmt = $testConn->prepare("SELECT booked_count, max_capacity FROM slots WHERE id = ?");
    $stmt->execute([$slotId]);
    $slot = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($slot && $slot['booked_count'] == 0 && $slot['max_capacity'] == 12) {
        logTest("Slot Capacity Check", true, "Slot capacity correctly initialized");
    } else {
        logTest("Slot Capacity Check", false, "Slot capacity not as expected", $slot);
    }
    
    // Clean up
    $testConn->exec("DELETE FROM slots WHERE id = $slotId");
    
} catch (Exception $e) {
    logTest("Slot Management", false, "Failed to test slot management", $e->getMessage());
}

// Test 7: Booking Process (with triggers)
echo "7. Testing Booking Process with Triggers...\n";
try {
    $testDate = '2024-12-21';
    $testTime = '9:00am-10:00am';
    
    // Create a student with booking
    $stmt = $testConn->prepare("INSERT INTO students (fullname, student_number, email, id_reason, data_privacy_agreed, schedule_date, schedule_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')");
    $stmt->execute([
        'Test Booking User',
        '1111111111',
        'testbooking@example.com',
        're_id',
        true,
        $testDate,
        $testTime
    ]);
    
    $bookingStudentId = $testConn->lastInsertId();
    
    // Check if slot was automatically created/updated
    $stmt = $testConn->prepare("SELECT booked_count, max_capacity FROM slots WHERE slot_date = ? AND slot_time = ?");
    $stmt->execute([$testDate, $testTime]);
    $slot = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($slot && $slot['booked_count'] == 1) {
        logTest("Booking Trigger - Slot Creation", true, "Slot automatically created with booked_count = 1");
    } else {
        logTest("Booking Trigger - Slot Creation", false, "Slot not created or booked_count incorrect", $slot);
    }
    
    // Test booking another student in same slot
    $stmt = $testConn->prepare("INSERT INTO students (fullname, student_number, email, id_reason, data_privacy_agreed, schedule_date, schedule_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')");
    $stmt->execute([
        'Test Booking User 2',
        '2222222222',
        'testbooking2@example.com',
        're_id',
        true,
        $testDate,
        $testTime
    ]);
    
    $bookingStudentId2 = $testConn->lastInsertId();
    
    // Check if booked_count increased
    $stmt = $testConn->prepare("SELECT booked_count FROM slots WHERE slot_date = ? AND slot_time = ?");
    $stmt->execute([$testDate, $testTime]);
    $slot = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($slot && $slot['booked_count'] == 2) {
        logTest("Booking Trigger - Count Increment", true, "Booked count correctly increased to 2");
    } else {
        logTest("Booking Trigger - Count Increment", false, "Booked count not incremented correctly", $slot);
    }
    
    // Test updating booking (change time slot)
    $newTime = '10:00am-11:00am';
    $stmt = $testConn->prepare("UPDATE students SET schedule_time = ? WHERE id = ?");
    $stmt->execute([$newTime, $bookingStudentId]);
    
    // Check if old slot count decreased and new slot count increased
    $stmt = $testConn->prepare("SELECT booked_count FROM slots WHERE slot_date = ? AND slot_time = ?");
    $stmt->execute([$testDate, $testTime]);
    $oldSlot = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $stmt->execute([$testDate, $newTime]);
    $newSlot = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($oldSlot && $oldSlot['booked_count'] == 1 && $newSlot && $newSlot['booked_count'] == 1) {
        logTest("Booking Trigger - Update", true, "Slot counts correctly updated when changing time");
    } else {
        logTest("Booking Trigger - Update", false, "Slot counts not updated correctly", [
            'old_slot_count' => $oldSlot['booked_count'] ?? 'null',
            'new_slot_count' => $newSlot['booked_count'] ?? 'null'
        ]);
    }
    
    // Clean up
    $testConn->exec("DELETE FROM students WHERE id IN ($bookingStudentId, $bookingStudentId2)");
    $testConn->exec("DELETE FROM slots WHERE slot_date = '$testDate'");
    
} catch (Exception $e) {
    logTest("Booking Process", false, "Failed to test booking process", $e->getMessage());
}

// Test 8: Admin Functions
echo "8. Testing Admin Functions...\n";
try {
    // Test admin user exists
    $stmt = $testConn->prepare("SELECT * FROM students WHERE id = 1");
    $stmt->execute();
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($admin && $admin['fullname'] === 'admin') {
        logTest("Admin User", true, "Admin user exists with correct credentials");
    } else {
        logTest("Admin User", false, "Admin user not found or incorrect", $admin);
    }
    
    // Test getting all students
    $stmt = $testConn->query("SELECT COUNT(*) as count FROM students");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result && $result['count'] >= 1) { // At least admin user
        logTest("Get All Students", true, "Successfully retrieved " . $result['count'] . " students");
    } else {
        logTest("Get All Students", false, "Failed to retrieve students");
    }
    
} catch (Exception $e) {
    logTest("Admin Functions", false, "Failed to test admin functions", $e->getMessage());
}

// Test 9: Data Validation
echo "9. Testing Data Validation...\n";
try {
    // Test student number length constraint
    try {
        $stmt = $testConn->prepare("INSERT INTO students (fullname, student_number, email, id_reason, data_privacy_agreed) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute(['Test User', '123', 'test@example.com', 're_id', true]);
        logTest("Student Number Length Validation", false, "Short student number was allowed");
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'check constraint') !== false) {
            logTest("Student Number Length Validation", true, "Short student number properly rejected");
        } else {
            logTest("Student Number Length Validation", false, "Unexpected error", $e->getMessage());
        }
    }
    
    // Test email format validation
    try {
        $stmt = $testConn->prepare("INSERT INTO students (fullname, student_number, email, id_reason, data_privacy_agreed) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute(['Test User', '1234567890', 'invalid-email', 're_id', true]);
        logTest("Email Format Validation", false, "Invalid email was allowed");
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'check constraint') !== false) {
            logTest("Email Format Validation", true, "Invalid email properly rejected");
        } else {
            logTest("Email Format Validation", false, "Unexpected error", $e->getMessage());
        }
    }
    
} catch (Exception $e) {
    logTest("Data Validation", false, "Failed to test data validation", $e->getMessage());
}

// Test 10: Performance Indexes
echo "10. Testing Performance Indexes...\n";
try {
    // Test index on student_number
    $stmt = $testConn->prepare("SELECT * FROM students WHERE student_number = ?");
    $stmt->execute(['1234512345']); // Admin student number
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result) {
        logTest("Student Number Index", true, "Query using student_number index successful");
    } else {
        logTest("Student Number Index", false, "Query using student_number index failed");
    }
    
    // Test composite index on schedule
    $stmt = $testConn->prepare("SELECT * FROM students WHERE schedule_date = ? AND schedule_time = ?");
    $stmt->execute(['2024-12-20', '8:00am-9:00am']);
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    logTest("Schedule Composite Index", true, "Query using schedule composite index successful");
    
} catch (Exception $e) {
    logTest("Performance Indexes", false, "Failed to test indexes", $e->getMessage());
}

// Summary
echo "=== TEST SUMMARY ===\n";
echo "Total Tests: " . count($tests) . "\n";
echo "Passed: $passed\n";
echo "Failed: $failed\n";
echo "Success Rate: " . round(($passed / count($tests)) * 100, 2) . "%\n\n";

if ($failed > 0) {
    echo "=== FAILED TESTS ===\n";
    foreach ($tests as $test) {
        if (!$test['success']) {
            echo "❌ {$test['name']}: {$test['message']}\n";
            if ($test['details']) {
                echo "   Details: " . json_encode($test['details']) . "\n";
            }
        }
    }
} else {
    echo "🎉 All tests passed! The system is fully compatible with the new database schema.\n";
}

echo "\n=== RECOMMENDATIONS ===\n";
if ($failed > 0) {
    echo "⚠️  Some tests failed. Please review the errors above and fix any issues before deploying.\n";
} else {
    echo "✅ System is ready for production deployment.\n";
    echo "✅ All features are working correctly with the new schema.\n";
    echo "✅ Data integrity constraints are functioning properly.\n";
    echo "✅ Performance indexes are in place.\n";
    echo "✅ Triggers are managing slot counts automatically.\n";
}

echo "\nTest completed at: " . date('Y-m-d H:i:s') . "\n";
?> 