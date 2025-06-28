<?php
include 'config.php';

$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$date = $_GET['schedule_date'] ?? '';
$time = $_GET['schedule_time'] ?? '';

if ($date && $time) {
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM students 
        WHERE TRIM(schedule_date) = TRIM(:schedule_date) 
          AND TRIM(schedule_time) = TRIM(:schedule_time)
          AND (status IS NULL OR status = 'pending')");

    error_log("📅 DATE: " . $date);
    error_log("🕒 TIME: " . $time);

    $stmt->execute([
        'schedule_date' => $date,
        'schedule_time' => $time
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['count' => (int)$row['count']]);
} else {
    echo json_encode(['error' => 'Missing date or time']);
}
