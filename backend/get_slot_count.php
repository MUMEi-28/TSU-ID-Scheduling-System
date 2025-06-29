<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

include 'config.php';
include 'utils.php';

$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Accept JSON input as well as form data
    $input = json_decode(file_get_contents('php://input'), true);
    $date = normalize_schedule_date($input['schedule_date'] ?? $_GET['schedule_date'] ?? $_POST['schedule_date'] ?? '');
    $time = normalize_slot_time($input['schedule_time'] ?? $_GET['schedule_time'] ?? $_POST['schedule_time'] ?? '');

    error_log('[DEBUG] get_slot_count.php called with: date=' . $date . ', time=' . $time);

    if (!$date || !$time) {
        error_log('[ERROR] get_slot_count.php missing date or time');
        echo json_encode(['error' => 'Missing date or time', 'count' => 0, 'max_capacity' => 12]);
        exit;
    }

    // Log all slot_time values for the date for easier comparison
    $allSlots = $conn->prepare("SELECT slot_time FROM slots WHERE slot_date = :schedule_date");
    $allSlots->execute(['schedule_date' => $date]);
    $allSlotTimes = $allSlots->fetchAll(PDO::FETCH_COLUMN);
    error_log('[DEBUG] Existing slot_time values for date ' . $date . ': ' . json_encode($allSlotTimes));

    // First, check if the slot exists, if not create it
    $checkSlot = $conn->prepare("SELECT id, max_capacity FROM slots WHERE TRIM(slot_date) = TRIM(:schedule_date) AND slot_time = :schedule_time LIMIT 1");
    $checkSlot->execute([
        'schedule_date' => $date,
        'schedule_time' => $time
    ]);
    
    $existingSlot = $checkSlot->fetch(PDO::FETCH_ASSOC);
    
    if (!$existingSlot) {
        // Slot doesn't exist, create it with default max_capacity
        $createSlot = $conn->prepare("INSERT INTO slots (slot_date, slot_time, max_capacity, booked_count) VALUES (:schedule_date, :schedule_time, 12, 0)");
        $createSlot->execute([
            'schedule_date' => $date,
            'schedule_time' => $time
        ]);
        error_log('[DEBUG] Created new slot for date=' . $date . ', time=' . $time);
    }
    
    // Now get the count and max_capacity
    $stmt = $conn->prepare("SELECT 
        (SELECT COUNT(*) FROM students WHERE TRIM(schedule_date) = TRIM(:schedule_date) AND schedule_time = :schedule_time AND (status IS NULL OR status = 'pending')) as count,
        (SELECT max_capacity FROM slots WHERE TRIM(slot_date) = TRIM(:schedule_date) AND slot_time = :schedule_time LIMIT 1) as max_capacity");

    error_log("[DEBUG] Querying for date: " . $date . ", time: " . $time);

    $stmt->execute([
        'schedule_date' => $date,
        'schedule_time' => $time
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $count = isset($row['count']) ? (int)$row['count'] : 0;
    $maxCapacity = isset($row['max_capacity']) ? (int)$row['max_capacity'] : 12;
    
    error_log('[DEBUG] Result: count=' . $count . ', max_capacity=' . $maxCapacity);
    
    echo json_encode([
        'count' => $count,
        'max_capacity' => $maxCapacity,
        'available' => max(0, $maxCapacity - $count)
    ]);
    
} catch (Exception $e) {
    error_log('[ERROR] get_slot_count.php exception: ' . $e->getMessage());
    echo json_encode([
        'error' => 'Internal server error',
        'count' => 0,
        'max_capacity' => 12,
        'available' => 12
    ]);
}
