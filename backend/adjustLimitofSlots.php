<?php
include 'config.php';
include 'utils.php';

error_log('[DEBUG] adjustLimitofSlots.php called with: ' . file_get_contents('php://input'));

$input = json_decode(file_get_contents('php://input'), true);
$date = normalize_schedule_date($input['schedule_date'] ?? $_POST['schedule_date'] ?? '');
$time = normalize_slot_time($input['schedule_time'] ?? $_POST['schedule_time'] ?? '');
$action = $input['action'] ?? $_POST['action'] ?? '';

// Log all slot_time values for the date for easier comparison
$allSlots = $conn->prepare("SELECT slot_time FROM slots WHERE slot_date = :schedule_date");
$allSlots->execute(['schedule_date' => $date]);
$allSlotTimes = $allSlots->fetchAll(PDO::FETCH_COLUMN);
error_log('[DEBUG] Existing slot_time values for date ' . $date . ': ' . json_encode($allSlotTimes));

header('Content-Type: application/json');

if (!$date || !$time || !in_array($action, ['increase', 'decrease'])) {
    error_log('[DEBUG] adjustLimitofSlots.php missing or invalid parameters: ' . json_encode(['date' => $date, 'time' => $time, 'action' => $action]));
    echo json_encode(['success' => false, 'error' => 'Missing or invalid parameters']);
    exit;
}

try {
    // Check if reducing capacity would violate existing bookings
    if ($action === 'decrease') {
        $currentBookings = $conn->prepare("SELECT COUNT(*) as count FROM students WHERE schedule_date = :schedule_date AND schedule_time = :schedule_time AND (status IS NULL OR status = 'pending')");
        $currentBookings->execute([
            'schedule_date' => $date,
            'schedule_time' => $time
        ]);
        $bookingCount = $currentBookings->fetch(PDO::FETCH_ASSOC)['count'];
        
        $currentCapacity = $conn->prepare("SELECT max_capacity FROM slots WHERE slot_date = :schedule_date AND slot_time = :schedule_time LIMIT 1");
        $currentCapacity->execute([
            'schedule_date' => $date,
            'schedule_time' => $time
        ]);
        $capacity = $currentCapacity->fetch(PDO::FETCH_ASSOC);
        $currentMaxCapacity = $capacity ? (int)$capacity['max_capacity'] : 12;
        
        if ($bookingCount >= $currentMaxCapacity) {
            echo json_encode(['success' => false, 'error' => 'Cannot reduce capacity: slot is already at maximum bookings']);
            exit;
        }
    }

    // Determine increment or decrement
    $delta = $action === 'increase' ? 1 : -1;
    // Use PDO to update the max_capacity field
    error_log('[DEBUG] Attempting UPDATE with slot_date=' . $date . ', slot_time=' . $time);
    $stmt = $conn->prepare("UPDATE slots SET max_capacity = GREATEST(0, max_capacity + :delta) WHERE TRIM(slot_date) = TRIM(:schedule_date) AND slot_time = :schedule_time");
    $stmt->bindValue(':delta', $delta, PDO::PARAM_INT);
    $stmt->bindValue(':schedule_date', $date, PDO::PARAM_STR);
    $stmt->bindValue(':schedule_time', $time, PDO::PARAM_STR);
    $stmt->execute();
    error_log('[DEBUG] adjustLimitofSlots.php update rowCount: ' . $stmt->rowCount());
    // Check if any row was updated
    if ($stmt->rowCount() > 0) {
        error_log('[DEBUG] adjustLimitofSlots.php update success for: ' . json_encode(['date' => $date, 'time' => $time, 'action' => $action]));
        echo json_encode(['success' => true]);
    } else {
        // No matching slot found, so create it
        $initial_capacity = $action === 'increase' ? 13 : 12; // 12+1 for increase, 12 for decrease
        $new_capacity = $action === 'increase' ? $initial_capacity : max(0, $initial_capacity - 1);
        $insert = $conn->prepare("INSERT INTO slots (slot_date, slot_time, max_capacity, booked_count) VALUES (:schedule_date, :slot_time, :max_capacity, 0)");
        $insert->bindValue(':schedule_date', $date, PDO::PARAM_STR);
        $insert->bindValue(':slot_time', $time, PDO::PARAM_STR);
        $insert->bindValue(':max_capacity', $new_capacity, PDO::PARAM_INT);
        if ($insert->execute()) {
            error_log('[DEBUG] adjustLimitofSlots.php slot created: ' . json_encode(['date' => $date, 'time' => $time, 'max_capacity' => $new_capacity]));
            echo json_encode(['success' => true, 'created' => true]);
        } else {
            $errorInfo = $insert->errorInfo();
            error_log('[DEBUG] adjustLimitofSlots.php INSERT error: ' . json_encode($errorInfo));
            echo json_encode(['success' => false, 'error' => 'Failed to create new slot', 'db_error' => $errorInfo]);
        }
    }
} catch (PDOException $e) {
    error_log('[DEBUG] adjustLimitofSlots.php PDOException: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
