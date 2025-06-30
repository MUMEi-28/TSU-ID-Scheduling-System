<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

include 'config.php';
include 'utils.php';

// Fallback handler for fatal errors
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        error_log("[register.php] Fatal error: " . $error['message'] . "\n", 3, __DIR__ . '/error_log.txt');
        if (!headers_sent()) {
            header('Content-Type: application/json');
        }
        echo json_encode([
            'status' => 0,
            'message' => 'A fatal error occurred. Please try again.'
        ]);
    }
});

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['status' => 1, 'message' => 'CORS preflight OK']);
    return;
}

try {
    // Get raw input and validate JSON
    $rawInput = file_get_contents('php://input');
    if (empty($rawInput)) {
        error_log("[register.php] Received empty input\n", 3, __DIR__ . '/error_log.txt');
        echo json_encode(['status' => 0, 'message' => 'No data received']);
        return;
    }
    
    $input = json_decode($rawInput);
    if ($input === null) {
        error_log("[register.php] Error: Invalid JSON data received\n", 3, __DIR__ . '/error_log.txt');
        echo json_encode(['status' => 0, 'message' => 'Invalid data format received']);
        return;
    }
    
    // Log received data for debugging
    error_log("[register.php] Received data: " . $rawInput . "\n", 3, __DIR__ . '/error_log.txt');
    
    // Validate required fields
    if (empty($input->fullname)) {
        error_log("[register.php] Full name is required\n", 3, __DIR__ . '/error_log.txt');
        echo json_encode(['status' => 0, 'message' => 'Full name is required']);
        return;
    }
    if (empty($input->student_number)) {
        error_log("[register.php] Student number is required\n", 3, __DIR__ . '/error_log.txt');
        echo json_encode(['status' => 0, 'message' => 'Student number is required']);
        return;
    }
    if (empty($input->id_reason)) {
        error_log("[register.php] ID reason is required\n", 3, __DIR__ . '/error_log.txt');
        echo json_encode(['status' => 0, 'message' => 'ID reason is required']);
        return;
    }
    if (empty($input->schedule_date)) {
        error_log("[register.php] Schedule date is required\n", 3, __DIR__ . '/error_log.txt');
        echo json_encode(['status' => 0, 'message' => 'Schedule date is required']);
        return;
    }
    if (empty($input->schedule_time)) {
        error_log("[register.php] Schedule time is required\n", 3, __DIR__ . '/error_log.txt');
        echo json_encode(['status' => 0, 'message' => 'Schedule time is required']);
        return;
    }
    if (empty($input->status)) {
        error_log("[register.php] Status is required\n", 3, __DIR__ . '/error_log.txt');
        echo json_encode(['status' => 0, 'message' => 'Status is required']);
        return;
    }
    if (!isset($input->data_privacy_agreed) || !$input->data_privacy_agreed) {
        error_log("[register.php] Data privacy agreement is required\n", 3, __DIR__ . '/error_log.txt');
        echo json_encode(['status' => 0, 'message' => 'Data privacy agreement is required']);
        return;
    }

    // Validate student number format
    if (!preg_match('/^\d{10}$/', $input->student_number)) {
        echo json_encode(['status' => 0, 'message' => 'Student number must be exactly 10 digits']);
        return;
    }

    // Check if student number already exists
    $checkSql = "SELECT id FROM students WHERE student_number = :student_number";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bindParam(':student_number', $input->student_number);
    $checkStmt->execute();
    
    if ($checkStmt->fetch()) {
        error_log("[register.php] Student number already exists: {$input->student_number}\n", 3, __DIR__ . '/error_log.txt');
        echo json_encode(['status' => 0, 'message' => 'Student number already exists']);
        return;
    }

    // Check if email already exists (only if email is provided)
    if (!empty($input->email)) {
        $emailCheckSql = "SELECT id FROM students WHERE email = :email";
        $emailCheckStmt = $conn->prepare($emailCheckSql);
        $emailCheckStmt->bindParam(':email', $input->email);
        $emailCheckStmt->execute();
        
        if ($emailCheckStmt->fetch()) {
            error_log("[register.php] Email already exists: {$input->email}\n", 3, __DIR__ . '/error_log.txt');
            echo json_encode(['status' => 0, 'message' => 'Email address already exists']);
            return;
        }
    }

    // Normalize schedule data if provided
    $normalized_schedule_date = null;
    $normalized_schedule_time = null;
    
    if (!empty($input->schedule_date)) {
        $normalized_schedule_date = normalize_schedule_date($input->schedule_date);
    }
    if (!empty($input->schedule_time)) {
        $normalized_schedule_time = normalize_slot_time($input->schedule_time);
    }

    // Prepare and execute SQL - save the complete student data
    $sql = "INSERT INTO students (fullname, student_number, email, id_reason, data_privacy_agreed, schedule_time, schedule_date, status) 
            VALUES (:fullname, :student_number, :email, :id_reason, :data_privacy_agreed, :schedule_time, :schedule_date, :status)";

    $stmt = $conn->prepare($sql);
    $stmt->bindValue(':fullname', $input->fullname);
    $stmt->bindValue(':student_number', $input->student_number);
    $stmt->bindValue(':email', $input->email ?? null);
    $stmt->bindValue(':id_reason', $input->id_reason);
    $stmt->bindValue(':data_privacy_agreed', $input->data_privacy_agreed, PDO::PARAM_BOOL);
    $stmt->bindValue(':schedule_time', $normalized_schedule_time);
    $stmt->bindValue(':schedule_date', $normalized_schedule_date);
    $stmt->bindValue(':status', $input->status);

    if ($stmt->execute()) {
        $studentId = $conn->lastInsertId();
        echo json_encode([
            'status' => 1,
            'message' => 'Registration successful',
            'student_id' => $studentId
        ]);
    } else {
        throw new Exception("Failed to register student");
    }

} catch (PDOException $e) {
    // Handle specific database errors
    if ($e->getCode() == 23000) {
        if (strpos($e->getMessage(), 'email') !== false) {
            error_log("[register.php] Error: " . $e->getMessage() . "\n", 3, __DIR__ . '/error_log.txt');
            echo json_encode(['status' => 0, 'message' => 'Email address already exists']);
        } elseif (strpos($e->getMessage(), 'student_number') !== false) {
            error_log("[register.php] Error: " . $e->getMessage() . "\n", 3, __DIR__ . '/error_log.txt');
            echo json_encode(['status' => 0, 'message' => 'Student number already exists']);
        } else {
            error_log("[register.php] Error: " . $e->getMessage() . "\n", 3, __DIR__ . '/error_log.txt');
            echo json_encode(['status' => 0, 'message' => 'Registration failed. Please try again.']);
        }
    } else {
        error_log("[register.php] Error: " . $e->getMessage() . "\n", 3, __DIR__ . '/error_log.txt');
        echo json_encode(['status' => 0, 'message' => 'Registration failed. Please try again.']);
    }
} catch (Exception $e) {
    error_log("[register.php] Error: " . $e->getMessage() . "\n", 3, __DIR__ . '/error_log.txt');
    echo json_encode([
        'status' => 0,
        'message' => 'Registration failed. Please try again.'
    ]);
}
