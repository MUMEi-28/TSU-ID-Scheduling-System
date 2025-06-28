<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

include 'config.php';

$student_id = $_GET['id'] ?? null;

if (!$student_id) {
    echo json_encode(['status' => 0, 'message' => 'Student ID is required']);
    exit;
}

try {
    $sql = "SELECT id, fullname, student_number, schedule_date, schedule_time, status FROM students WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $student_id);
    $stmt->execute();
    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($student) {
        echo json_encode(['status' => 1, 'data' => $student]);
    } else {
        echo json_encode(['status' => 0, 'message' => 'Student not found']);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 0, 'message' => 'Internal server error']);
}
