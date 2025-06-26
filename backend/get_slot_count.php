<?php
include 'config.php';


$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$date = $_GET['schedule_date'] ?? '';
$time = $_GET['schedule_time'] ?? '';

if ($date && $time) {
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM students WHERE schedule_date = :schedule_date AND schedule_time = :schedule_time");
    $stmt->execute(['schedule_date' => $date, 'schedule_time' => $time]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['count' => $row['count']]);
} else {
    echo json_encode(['error' => 'Missing date or time']);
}
