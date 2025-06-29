<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

include 'config.php';
include 'utils.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'));
    
    // Validate required fields
    if (empty($input->fullname)) {
        echo json_encode(['status' => 0, 'message' => 'Full name is required']);
        exit;
    }
    if (empty($input->student_number)) {
        echo json_encode(['status' => 0, 'message' => 'Student number is required']);
        exit;
    }
    if (empty($input->id_reason)) {
        echo json_encode(['status' => 0, 'message' => 'ID reason is required']);
        exit;
    }
    if (!isset($input->data_privacy_agreed) || !$input->data_privacy_agreed) {
        echo json_encode(['status' => 0, 'message' => 'Data privacy agreement is required']);
        exit;
    }

    // Check if student number already exists
    $checkSql = "SELECT id FROM students WHERE student_number = :student_number";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bindParam(':student_number', $input->student_number);
    $checkStmt->execute();
    
    if ($checkStmt->fetch()) {
        echo json_encode(['status' => 0, 'message' => 'Student number already exists']);
        exit;
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
            VALUES (:fullname, :student_number, :email, :id_reason, :data_privacy_agreed, :schedule_time, :schedule_date, 'pending')";

    $stmt = $conn->prepare($sql);
    $stmt->bindValue(':fullname', $input->fullname);
    $stmt->bindValue(':student_number', $input->student_number);
    $stmt->bindValue(':email', $input->email);
    $stmt->bindValue(':id_reason', $input->id_reason);
    $stmt->bindValue(':data_privacy_agreed', $input->data_privacy_agreed, PDO::PARAM_BOOL);
    $stmt->bindValue(':schedule_time', $normalized_schedule_time);
    $stmt->bindValue(':schedule_date', $normalized_schedule_date);

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

} catch (Exception $e) {
    error_log("[register.php] Error: " . $e->getMessage() . "\n", 3, __DIR__ . '/error_log.txt');
    echo json_encode([
        'status' => 0,
        'message' => $e->getMessage()
    ]);
}
