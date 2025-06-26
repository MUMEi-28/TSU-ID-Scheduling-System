<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

include 'config.php';

// --- Rate Limiting ---
$ip = $_SERVER['REMOTE_ADDR'];
$rateFile = sys_get_temp_dir() . "/tsu_rate_" . md5($ip) . "_register";
$limit = 10; // max requests
$window = 300; // 5 minutes
$now = time();
$requests = [];
if (file_exists($rateFile)) {
    $requests = json_decode(file_get_contents($rateFile), true) ?: [];
    $requests = array_filter($requests, function($t) use ($now, $window) { return $t > $now - $window; });
}
$requests[] = $now;
file_put_contents($rateFile, json_encode($requests));
if (count($requests) > $limit) {
    http_response_code(429);
    echo json_encode(["error" => "Rate limit exceeded. Please try again later."]);
    error_log("[register.php] Rate limit exceeded for $ip", 3, __DIR__ . '/error_log.txt');
    exit;
}

try {
    // Get raw input and decode JSON
    $json = file_get_contents('php://input');
    $input = json_decode($json);

    // Validate JSON decoding
    if ($input === null) {
        throw new Exception("Invalid JSON data received");
    }

    // Check required fields
    if (!isset($input->fullname)) {
        throw new Exception("Full name is required");
    }
    if (!isset($input->student_number)) {
        throw new Exception("Student number is required");
    }

    // Check if student_number is a 10-digit number
    if (!preg_match('/^\d{10}$/', $input->student_number)) {
        echo json_encode([
            'status' => 0,
            'message' => 'Invalid student number format. Please try again!'
        ]);
        exit;
    }

    // Check for duplicate student (fullname + student_number)
    $checkSql = "SELECT COUNT(*) FROM students WHERE fullname = :fullname AND student_number = :student_number";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bindParam(':fullname', $input->fullname);
    $checkStmt->bindParam(':student_number', $input->student_number);
    $checkStmt->execute();
    $count = $checkStmt->fetchColumn();
    if ($count > 0) {
        echo json_encode([
            'status' => 0,
            'message' => 'Student already exists. Please log in instead.'
        ]);
        exit;
    }

    // Prepare and execute SQL
    $sql = "INSERT INTO students (fullname, student_number, schedule_time, schedule_date) 
            VALUES (:fullname, :student_number, :schedule_time, :schedule_date)";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':fullname', $input->fullname);
    $stmt->bindParam(':student_number', $input->student_number);
    $stmt->bindParam(':schedule_time', $input->schedule_time);
    $stmt->bindParam(':schedule_date', $input->schedule_date);

    if ($stmt->execute()) {
        $studentToken = bin2hex(random_bytes(16));
        $response = [
            'status' => 1,
            'message' => 'Student Registered Successfully',
            'student_id' => $conn->lastInsertId(),
            'student_token' => $studentToken
        ];
    } else {
        $response = [
            'status' => 0,
            'message' => 'Registration failed'
        ];
    }

    echo json_encode($response);
} catch (Exception $e) {
    error_log("[register.php] " . $e->getMessage() . "\n", 3, __DIR__ . '/error_log.txt');
    echo json_encode([
        'status' => 0,
        'message' => 'Error: ' . $e->getMessage(),
        'received_data' => $json ?? null
    ]);
}
