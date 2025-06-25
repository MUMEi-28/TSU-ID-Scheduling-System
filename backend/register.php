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
        throw new Exception("Invalid JSON data received"); // To prevent Uncaught Error: Attempt to modify property &quot;fullname&quot; on null
    }

    // Check required fields
    if (!isset($input->fullname)) {
        throw new Exception("Full name is required");
    }
    if (!isset($input->student_number)) {
        throw new Exception("Student number is required");
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
