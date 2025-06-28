<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Content-Type: application/json");

include 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'));
    if (!$input || !isset($input->id)) {
        echo json_encode(['status' => 0, 'message' => 'Student ID is required']);
        exit;
    }
    // Validate required fields
    if (empty($input->schedule_date) || empty($input->schedule_time)) {
        echo json_encode(['status' => 0, 'message' => 'Schedule date and time are required']);
        exit;
    }
    $sql = "UPDATE students SET schedule_date = :schedule_date, schedule_time = :schedule_time, status = :status"
        . (isset($input->email) ? ", email = :email" : "")
        . (isset($input->id_reason) ? ", id_reason = :id_reason" : "")
        . (isset($input->data_privacy_agreed) ? ", data_privacy_agreed = :data_privacy_agreed" : "")
        . " WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':schedule_date', $input->schedule_date);
    $stmt->bindParam(':schedule_time', $input->schedule_time);
    $stmt->bindParam(':status', $input->status);
    if (isset($input->email)) $stmt->bindParam(':email', $input->email);
    if (isset($input->id_reason)) $stmt->bindParam(':id_reason', $input->id_reason);
    if (isset($input->data_privacy_agreed)) $stmt->bindParam(':data_privacy_agreed', $input->data_privacy_agreed);
    $stmt->bindParam(':id', $input->id);
    if ($stmt->execute()) {
        echo json_encode(['status' => 1, 'message' => 'Slot confirmed and student updated successfully']);
    } else {
        echo json_encode(['status' => 0, 'message' => 'Failed to update student']);
    }
} catch (Exception $e) {
    error_log("[confirm_slot.php] " . $e->getMessage() . "\n", 3, __DIR__ . '/error_log.txt');
    echo json_encode(['status' => 0, 'message' => 'Internal server error']);
} 