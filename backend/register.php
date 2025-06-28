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

    // Add more debugging
    error_log("[register.php] Validated data - fullname: {$input->fullname}, student_number: {$input->student_number}, schedule_date: {$input->schedule_date}, schedule_time: {$input->schedule_time}\n", 3, __DIR__ . '/error_log.txt');

    // Prepare and execute SQL - save the confirmed slot data
    $sql = "INSERT INTO students (fullname, student_number, schedule_time, schedule_date, status) 
            VALUES (:fullname, :student_number, :schedule_time, :schedule_date, 'pending')";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':fullname', $input->fullname);
    $stmt->bindParam(':student_number', $input->student_number);
    $stmt->bindParam(':schedule_time', $input->schedule_time);
    $stmt->bindParam(':schedule_date', $input->schedule_date);

    if ($stmt->execute()) {
        $studentToken = bin2hex(random_bytes(16));
        $response = [
            'status' => 1,
            'message' => 'Welcome! Your slot has been created successfully.',
            'student_id' => $conn->lastInsertId(),
            'student_token' => $studentToken
        ];
        error_log("[register.php] Successfully inserted student with ID: " . $conn->lastInsertId() . "\n", 3, __DIR__ . '/error_log.txt');
    } else {
        $response = [
            'status' => 0,
            'message' => 'Sorry, we couldn\'t create your slot right now. Please try again.'
        ];
        error_log("[register.php] Failed to insert student\n", 3, __DIR__ . '/error_log.txt');
    }

    echo json_encode($response);
} catch (Exception $e) {
    error_log("[register.php] " . $e->getMessage() . "\n", 3, __DIR__ . '/error_log.txt');
    echo json_encode([
        'status' => 0,
        'message' => 'Something went wrong. Please check your information and try again.',
        'received_data' => $json ?? null
    ]);
}
