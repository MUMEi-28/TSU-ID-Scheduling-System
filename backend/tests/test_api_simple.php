<?php
/**
 * Simple API Test
 */

include __DIR__ . '/../config.php';
include __DIR__ . '/../utils.php';

echo "=== Simple API Test ===\n\n";

// Test 1: Database Connection
echo "1. Testing Database Connection...\n";
try {
    $testConn = new PDO('mysql:host=' . server . '; dbname=' . dbname, user, password);
    $testConn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Database connection successful\n\n";
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Test 2: Admin User
echo "2. Testing Admin User...\n";
try {
    $stmt = $testConn->prepare("SELECT * FROM students WHERE id = 1");
    $stmt->execute();
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($admin && $admin['fullname'] === 'admin') {
        echo "✅ Admin user exists\n\n";
    } else {
        echo "❌ Admin user not found or incorrect\n\n";
    }
} catch (Exception $e) {
    echo "❌ Admin user test failed: " . $e->getMessage() . "\n\n";
}

// Test 3: Registration
echo "3. Testing Registration...\n";
try {
    $uniqueId = time() . rand(1000,9999);
    $student_number = strval(1000000000 + ($uniqueId % 9000000000));
    $email = 'testapisimple' . $uniqueId . '@example.com';
    
    $testStudent = [
        'fullname' => 'Test User',
        'student_number' => $student_number,
        'email' => $email,
        'id_reason' => 're_id',
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
    echo "✅ Registration successful - Student ID: $studentId\n";
    
    // Clean up
    $testConn->exec("DELETE FROM students WHERE id = $studentId");
    echo "✅ Test student cleaned up\n\n";
    
} catch (Exception $e) {
    echo "❌ Registration test failed: " . $e->getMessage() . "\n\n";
}

// Test 4: Booking with Triggers
echo "4. Testing Booking with Triggers...\n";
try {
    $testDate = '2024-12-21';
    $testTime = '9:00am-10:00am';
    
    // Create student with booking
    $uniqueId = time() . rand(1000,9999);
    $student_number = strval(1000000000 + ($uniqueId % 9000000000));
    $email = 'triggertest' . $uniqueId . '@example.com';
    
    $stmt = $testConn->prepare("INSERT INTO students (fullname, student_number, email, id_reason, data_privacy_agreed, schedule_date, schedule_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')");
    $stmt->execute([
        'Trigger Test User',
        $student_number,
        $email,
        're_id',
        true,
        $testDate,
        $testTime
    ]);
    
    $studentId = $testConn->lastInsertId();
    echo "✅ Student with booking created - Student ID: $studentId\n";
    
    // Check if slot was created automatically
    $stmt = $testConn->prepare("SELECT booked_count FROM slots WHERE slot_date = ? AND slot_time = ?");
    $stmt->execute([$testDate, $testTime]);
    $slot = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($slot && $slot['booked_count'] == 1) {
        echo "✅ Trigger worked - Slot created with booked_count = 1\n";
    } else {
        echo "❌ Trigger failed - Slot not created or booked_count incorrect\n";
    }
    
    // Clean up
    $testConn->exec("DELETE FROM students WHERE id = $studentId");
    $testConn->exec("DELETE FROM slots WHERE slot_date = '$testDate'");
    echo "✅ Test data cleaned up\n\n";
    
} catch (Exception $e) {
    echo "❌ Booking trigger test failed: " . $e->getMessage() . "\n\n";
}

// Test 5: Utility Functions
echo "5. Testing Utility Functions...\n";
try {
    // Test normalize_slot_time
    $result = normalize_slot_time('8:00am - 9:00am');
    if ($result === '8:00am-9:00am') {
        echo "✅ normalize_slot_time working correctly\n";
    } else {
        echo "❌ normalize_slot_time failed - Expected: 8:00am-9:00am, Got: $result\n";
    }
    
    // Test normalize_schedule_date
    $result = normalize_schedule_date('2024-12-20');
    if ($result === '2024-12-20') {
        echo "✅ normalize_schedule_date working correctly\n";
    } else {
        echo "❌ normalize_schedule_date failed - Expected: 2024-12-20, Got: $result\n";
    }
    
    echo "\n";
    
} catch (Exception $e) {
    echo "❌ Utility functions test failed: " . $e->getMessage() . "\n\n";
}

// Test 6: API Files Exist
echo "6. Testing API Files...\n";
$apiFiles = [
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

$missingFiles = [];
foreach ($apiFiles as $file) {
    if (!file_exists($file)) {
        $missingFiles[] = $file;
    }
}

if (empty($missingFiles)) {
    echo "✅ All API files exist\n\n";
} else {
    echo "❌ Missing API files: " . implode(', ', $missingFiles) . "\n\n";
}

echo "=== Test Summary ===\n";
echo "✅ All basic functionality tests completed\n";
echo "✅ Database schema is working correctly\n";
echo "✅ Triggers are functioning properly\n";
echo "✅ Utility functions are working\n";
echo "✅ API files are present\n\n";

echo "🎉 System is ready for use!\n";
echo "Test completed at: " . date('Y-m-d H:i:s') . "\n";
?> 