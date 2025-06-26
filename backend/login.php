<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

include 'config.php';

// --- Rate Limiting ---
$ip = $_SERVER['REMOTE_ADDR'];
$rateFile = sys_get_temp_dir() . "/tsu_rate_" . md5($ip) . "_login";
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
    error_log("[login.php] Rate limit exceeded for $ip", 3, __DIR__ . '/error_log.txt');
    exit;
}

try {
    $json = file_get_contents('php://input');
    $input = json_decode($json);

    if (!isset($input->fullname) || !isset($input->student_number)) {
        throw new Exception("Full name and student number are required");
    }

    // Check for admin (id=1)
    $adminSql = "SELECT id, fullname, student_number FROM students WHERE id = 1 LIMIT 1";
    $adminStmt = $conn->prepare($adminSql);
    $adminStmt->execute();
    $admin = $adminStmt->fetch(PDO::FETCH_ASSOC);
    if ($admin && $input->fullname === $admin['fullname'] && $input->student_number === $admin['student_number']) {
        $adminToken = bin2hex(random_bytes(16));
        echo json_encode([
            'status' => 1,
            'message' => 'Admin login',
            'admin_token' => $adminToken,
            'is_admin' => true
        ]);
        exit;
    }

    // Check for student
    $studentSql = "SELECT id, fullname, student_number FROM students WHERE fullname = :fullname AND student_number = :student_number LIMIT 1";
    $studentStmt = $conn->prepare($studentSql);
    $studentStmt->bindParam(':fullname', $input->fullname);
    $studentStmt->bindParam(':student_number', $input->student_number);
    $studentStmt->execute();
    $student = $studentStmt->fetch(PDO::FETCH_ASSOC);
    if ($student) {
        $studentToken = bin2hex(random_bytes(16));
        echo json_encode([
            'status' => 1,
            'message' => 'Student login',
            'student_token' => $studentToken,
            'student_id' => $student['id'],
            'is_admin' => false
        ]);
        exit;
    }

    // Not found
    echo json_encode([
        'status' => 0,
        'message' => 'No matching user found. Please register first.'
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => 0,
        'message' => 'Error: ' . $e->getMessage()
    ]);
    error_log("[login.php] " . $e->getMessage() . "\n", 3, __DIR__ . '/error_log.txt');
}
