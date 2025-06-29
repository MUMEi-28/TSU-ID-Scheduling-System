<?php
include 'config.php';
include 'utils.php';

error_log('[DEBUG] get_max_slot_count.php called with: ' . json_encode($_GET));

$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$date = normalize_schedule_date($_GET['schedule_date'] ?? '');
$time = normalize_slot_time($_GET['schedule_time'] ?? '');

if ($date && $time) {
    // First, check if the slot exists, if not create it
    $checkSlot = $conn->prepare("SELECT id FROM slots WHERE TRIM(slot_date) = TRIM(:schedule_date) AND slot_time = :schedule_time LIMIT 1");
    $checkSlot->execute([
        'schedule_date' => $date,
        'schedule_time' => $time
    ]);
    if (!$checkSlot->fetch()) {
        // Slot doesn't exist, create it with default max_capacity
        $createSlot = $conn->prepare("INSERT INTO slots (slot_date, slot_time, max_capacity, booked_count) VALUES (:schedule_date, :schedule_time, 12, 0)");
        $createSlot->execute([
            'schedule_date' => $date,
            'schedule_time' => $time
        ]);
    }
    $stmt = $conn->prepare("SELECT max_capacity FROM slots WHERE TRIM(slot_date) = TRIM(:schedule_date) AND slot_time = :schedule_time LIMIT 1");
    $stmt->execute([
        'schedule_date' => $date,
        'schedule_time' => $time
    ]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    error_log('[DEBUG] get_max_slot_count.php query result: ' . json_encode($row));
    echo json_encode([
        'max_capacity' => isset($row['max_capacity']) && $row['max_capacity'] !== null ? (int)$row['max_capacity'] : 12
    ]);
} else {
    error_log('[DEBUG] get_max_slot_count.php missing date or time');
    echo json_encode(['error' => 'Missing date or time']);
}
