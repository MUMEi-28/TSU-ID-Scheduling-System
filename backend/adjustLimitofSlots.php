<?php
include 'config.php';

header('Content-Type: application/json');

// Accept JSON input as well as form data
$input = json_decode(file_get_contents('php://input'), true);
$date = $input['schedule_date'] ?? $_POST['schedule_date'] ?? '';
$time = $input['schedule_time'] ?? $_POST['schedule_time'] ?? '';
$action = $input['action'] ?? $_POST['action'] ?? '';

if (!$date || !$time || !in_array($action, ['increase', 'decrease'])) {
    echo json_encode(['success' => false, 'error' => 'Missing or invalid parameters']);
    exit;
}

try {
    // Determine increment or decrement
    $delta = $action === 'increase' ? 1 : -1;
    // Use PDO to update the max_capacity field
    $stmt = $conn->prepare("UPDATE slots SET max_capacity = GREATEST(0, max_capacity + :delta) WHERE TRIM(slot_date) = TRIM(:schedule_date) AND TRIM(slot_time) = TRIM(:schedule_time)");
    $stmt->bindValue(':delta', $delta, PDO::PARAM_INT);
    $stmt->bindValue(':schedule_date', $date, PDO::PARAM_STR);
    $stmt->bindValue(':schedule_time', $time, PDO::PARAM_STR);
    $stmt->execute();
    // Check if any row was updated
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'No matching slot found']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
