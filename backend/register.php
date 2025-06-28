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

    // Add debugging
    error_log("[register.php] Received data: " . $json . "\n", 3, __DIR__ . '/error_log.txt');

    // Validate JSON decoding
    if ($input === null) {
        throw new Exception("Invalid JSON data received");
    }

    // Validate required fields
    if (!isset($input->fullname) || !isset($input->student_number)) {
        throw new Exception("Full name and student number are required");
    }

    // Validate email for new users
    if (!isset($input->email) || !filter_var($input->email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Valid email address is required");
    }

    // Validate ID reason
    if (!isset($input->id_reason) || empty($input->id_reason)) {
        throw new Exception("Reason for ID creation is required");
    }

    // Validate data privacy agreement
    if (!isset($input->data_privacy_agreed) || !$input->data_privacy_agreed) {
        throw new Exception("You must agree to the data privacy terms");
    }

    // Check for existing student
    $checkSql = "SELECT id FROM students WHERE fullname = :fullname AND student_number = :student_number";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bindParam(':fullname', $input->fullname);
    $checkStmt->bindParam(':student_number', $input->student_number);
    $checkStmt->execute();
    
    if ($checkStmt->fetch()) {
        echo json_encode([
            'status' => 0,
            'message' => 'A student with this information already exists. Please try logging in instead.'
        ]);
        exit;
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
    $stmt->bindValue(':schedule_time', $input->schedule_time ?? null);
    $stmt->bindValue(':schedule_date', $input->schedule_date ?? null);

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
