<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

include 'config.php';

try {
    // Get raw input and decode JSON
    $json = file_get_contents('php://input');
    $input = json_decode($json);

    // Validate JSON decoding
    if ($input === null) {
        throw new Exception("Invalid JSON data received");
    }

    // Admin bypass: skip all checks and DB operations
    if (
        isset($input->fullname) && isset($input->student_number) &&
        $input->fullname === 'admin' && $input->student_number === '1234512345'
    ) {
        $adminToken = bin2hex(random_bytes(16));
        echo json_encode([
            'status' => 1,
            'message' => 'Admin login bypass',
            'admin_token' => $adminToken
        ]);
        exit;
    }

    // Check required fields
    if (!isset($input->fullname)) {
        throw new Exception("Full name is required");
    }
    if (!isset($input->student_number)) {
        throw new Exception("Student number is required");
    }

    // Check if student_number is a 10-digit number
    if (!preg_match('/^\d{10}$/', $input->student_number)) {
        echo json_encode([
            'status' => 0,
            'message' => 'Invalid student number format. Please try again!'
        ]);
        exit;
    }

    // Check for duplicate student number
    $checkSql = "SELECT COUNT(*) FROM students WHERE student_number = :student_number";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bindParam(':student_number', $input->student_number);
    $checkStmt->execute();
    $count = $checkStmt->fetchColumn();
    if ($count > 0) {
        echo json_encode([
            'status' => 0,
            'message' => 'Student number already exists. Please go to the Business Center with your printed schedule.'
        ]);
        exit;
    }

    // Prepare and execute SQL
    $sql = "INSERT INTO students (fullname, student_number, schedule_time, schedule_date) 
            VALUES (:fullname, :student_number, :schedule_time, :schedule_date)";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':fullname', $input->fullname);
    $stmt->bindParam(':student_number', $input->student_number);
    $stmt->bindParam(':schedule_time', $input->schedule_time);
    $stmt->bindParam(':schedule_date', $input->schedule_date);

    if ($stmt->execute()) {
        $response = [
            'status' => 1,
            'message' => 'Student Registered Successfully',
            'student_id' => $conn->lastInsertId()
        ];
    } else {
        $response = [
            'status' => 0,
            'message' => 'Registration failed'
        ];
    }

    echo json_encode($response);
} catch (Exception $e) {
    echo json_encode([
        'status' => 0,
        'message' => 'Error: ' . $e->getMessage(),
        'received_data' => $json ?? null
    ]);
}
