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
    echo json_encode(["error" => "Too many login attempts. Please wait 5 minutes and try again."]);
    error_log("[login.php] Rate limit exceeded for $ip", 3, __DIR__ . '/error_log.txt');
    exit;
}

try {
    // Get raw input and decode JSON
    $json = file_get_contents('php://input');
    $input = json_decode($json);

    // Validate JSON decoding
    if ($input === null) {
        throw new Exception("Please check your information and try again.");
    }

    // Check required fields
    if (!isset($input->fullname)) {
        throw new Exception("Please enter your full name.");
    }
    if (!isset($input->student_number)) {
        throw new Exception("Please enter your student number.");
    }

    // Check if student_number is a 10-digit number
    if (!preg_match('/^\d{10}$/', $input->student_number)) {
        echo json_encode([
            'status' => 0,
            'message' => 'Your student number should be exactly 10 digits. Please check and try again.'
        ]);
        exit;
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

    // Check for duplicate students (same as register.php logic)
    $checkSql = "SELECT COUNT(*) FROM students WHERE fullname = :fullname AND student_number = :student_number";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bindParam(':fullname', $input->fullname);
    $checkStmt->bindParam(':student_number', $input->student_number);
    $checkStmt->execute();
    $count = $checkStmt->fetchColumn();
    if ($count > 1) {
        echo json_encode([
            'status' => 0,
            'message' => 'We found multiple students with your information. Please contact the Business Office for assistance.'
        ]);
        exit;
    }

    // Check for student with valid status
    $studentSql = "SELECT id, fullname, student_number, status, schedule_date, schedule_time FROM students WHERE fullname = :fullname AND student_number = :student_number LIMIT 1";
    $studentStmt = $conn->prepare($studentSql);
    $studentStmt->bindParam(':fullname', $input->fullname);
    $studentStmt->bindParam(':student_number', $input->student_number);
    $studentStmt->execute();
    $student = $studentStmt->fetch(PDO::FETCH_ASSOC);
    if ($student) {
        // Only allow login if status is not 'done' or 'cancelled'
        if (in_array(strtolower($student['status']), ['done', 'cancelled'])) {
            $statusMessage = strtolower($student['status']) === 'done' 
                ? 'Your ID has already been processed and completed. If you need assistance, please visit the Business Center.'
                : 'Your ID request has been cancelled. Please contact the admin office if you need to reschedule.';
            
            echo json_encode([
                'status' => 0,
                'message' => $statusMessage,
                'student_status' => strtolower($student['status']),
                'student_id' => $student['id'],
                'student_data' => [
                    'id' => $student['id'],
                    'fullname' => $student['fullname'],
                    'student_number' => $student['student_number'],
                    'schedule_date' => $student['schedule_date'],
                    'schedule_time' => $student['schedule_time']
                ]
            ]);
            exit;
        }
        
        // For pending students, check if they already have a schedule
        if (strtolower($student['status']) === 'pending' && $student['schedule_date'] && $student['schedule_time']) {
            // Pending student with existing schedule
            echo json_encode([
                'status' => 2, // Special status for pending with schedule
                'message' => 'You already have a scheduled appointment. You can view your details or reschedule if needed.',
                'student_status' => 'pending_with_schedule',
                'student_id' => $student['id'],
                'student_data' => [
                    'id' => $student['id'],
                    'fullname' => $student['fullname'],
                    'student_number' => $student['student_number'],
                    'schedule_date' => $student['schedule_date'],
                    'schedule_time' => $student['schedule_time']
                ]
            ]);
            exit;
        }
        
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
        'message' => 'We couldn\'t find your account. Please register first or check your information.'
    ]);
} catch (Exception $e) {
    error_log("[login.php] " . $e->getMessage() . "\n", 3, __DIR__ . '/error_log.txt');
    echo json_encode([
        'status' => 0,
        'message' => 'Something went wrong. Please check your information and try again.',
        'received_data' => $json ?? null
    ]);
}
