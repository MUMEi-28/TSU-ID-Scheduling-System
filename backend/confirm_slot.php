<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Content-Type: application/json");

include 'config.php';
include 'utils.php';

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
    
    // Normalize the input data
    $normalized_date = normalize_schedule_date($input->schedule_date);
    $normalized_time = normalize_slot_time($input->schedule_time);
    
    // Check if the student already has a scheduled appointment
    $checkSql = "SELECT schedule_date, schedule_time FROM students WHERE id = :id";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bindParam(':id', $input->id);
    $checkStmt->execute();
    $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($existing && !empty($existing['schedule_date']) && !empty($existing['schedule_time'])) {
        echo json_encode(['status' => 0, 'message' => 'Existing appointment: You already have a scheduled slot.']);
        exit;
    }

    // Check if the slot is full (enforce max_capacity)
    $slotCheckSql = "SELECT 
        (SELECT COUNT(*) FROM students WHERE schedule_date = :schedule_date AND schedule_time = :schedule_time AND (status IS NULL OR status = 'pending')) as count,
        (SELECT max_capacity FROM slots WHERE slot_date = :schedule_date AND slot_time = :schedule_time LIMIT 1) as max_capacity";
    $slotCheckStmt = $conn->prepare($slotCheckSql);
    $slotCheckStmt->execute([
        'schedule_date' => $normalized_date,
        'schedule_time' => $normalized_time
    ]);
    $slotInfo = $slotCheckStmt->fetch(PDO::FETCH_ASSOC);
    $currentCount = isset($slotInfo['count']) ? (int)$slotInfo['count'] : 0;
    $maxCapacity = isset($slotInfo['max_capacity']) ? (int)$slotInfo['max_capacity'] : 12;
    if ($currentCount >= $maxCapacity) {
        echo json_encode(['status' => 0, 'message' => 'This slot is already full. Please choose another slot.']);
        exit;
    }

    $sql = "UPDATE students SET schedule_date = :schedule_date, schedule_time = :schedule_time, status = :status"
        . (isset($input->email) ? ", email = :email" : "")
        . (isset($input->id_reason) ? ", id_reason = :id_reason" : "")
        . (isset($input->data_privacy_agreed) ? ", data_privacy_agreed = :data_privacy_agreed" : "")
        . " WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':schedule_date', $normalized_date);
    $stmt->bindParam(':schedule_time', $normalized_time);
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