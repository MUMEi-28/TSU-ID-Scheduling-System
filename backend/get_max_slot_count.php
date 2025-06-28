<?php
include 'config.php';

$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$date = $_GET['schedule_date'] ?? '';
$time = $_GET['schedule_time'] ?? '';

if ($date && $time) {
    $stmt = $conn->prepare("SELECT max_capacity FROM slots
        WHERE TRIM(slot_date) = TRIM(:schedule_date)
          AND TRIM(slot_time) = TRIM(:schedule_time) LIMIT 1");

    error_log("📅 DATE: " . $date);
    error_log("🕒 TIME: " . $time);

    $stmt->execute([
        'schedule_date' => $date,
        'schedule_time' => $time
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['max_capacity' => isset($row['max_capacity']) ? (int)$row['max_capacity'] : null]);
} else {
    echo json_encode(['error' => 'Missing date or time']);
}
