<?php

/* THIS IS USED FOR TESTING PURPOSES ONLY */
/* TO BE MODULARIZED TO SEPARATE PHP FILES AFTER */

include 'config.php';
/* echo "TESTING"; */
/* 
var_dump($conn);
 */


$method = $_SERVER['REQUEST_METHOD'];
/* 
print_r(file_get_contents('php://input'));
 */

// --- Rate Limiting ---
$ip = $_SERVER['REMOTE_ADDR'];
$rateFile = sys_get_temp_dir() . "/tsu_rate_" . md5($ip) . "_index";
$limit = 30; // max requests
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
    error_log("[index.php] Rate limit exceeded for $ip", 3, __DIR__ . '/error_log.txt');
    exit;
}

switch ($method) {
    case "POST":
        echo json_encode(['status' => 0, 'message' => 'Registration requires complete schedule information']);
        break;
    case "PUT":
        try {
            $input = json_decode(file_get_contents('php://input'));
            error_log("[index.php][PUT] Incoming data: " . json_encode($input) . "\n", 3, __DIR__ . '/error_log.txt');
            if (!isset($input->id) || empty($input->id)) {
                error_log("[index.php][PUT] ERROR: Missing student id in update request\n", 3, __DIR__ . '/error_log.txt');
                echo json_encode(['status' => 0, 'message' => 'Missing student ID for update.']);
                exit;
            }
            $isFullUpdate = isset($input->schedule_date) && isset($input->schedule_time);
            error_log("[index.php][PUT] Checking for duplicate student_number for id: {$input->id}\n", 3, __DIR__ . '/error_log.txt');
            // Validate required fields (align with registration)
            if (empty($input->fullname)) {
                error_log("[index.php][PUT] Full name is required\n", 3, __DIR__ . '/error_log.txt');
                echo json_encode(['status' => 0, 'message' => 'Full name is required']);
                exit;
            }
            if (empty($input->student_number)) {
                error_log("[index.php][PUT] Student number is required\n", 3, __DIR__ . '/error_log.txt');
                echo json_encode(['status' => 0, 'message' => 'Student number is required']);
                exit;
            }
            if (empty($input->email)) {
                error_log("[index.php][PUT] Email is required\n", 3, __DIR__ . '/error_log.txt');
                echo json_encode(['status' => 0, 'message' => 'Email is required']);
                exit;
            }
            if (empty($input->id_reason)) {
                error_log("[index.php][PUT] ID reason is required\n", 3, __DIR__ . '/error_log.txt');
                echo json_encode(['status' => 0, 'message' => 'ID reason is required']);
                exit;
            }
            // Validate student number format
            if (!preg_match('/^\d{10}$/', $input->student_number)) {
                echo json_encode(['status' => 0, 'message' => 'Student number must be exactly 10 digits']);
                exit;
            }
            // Validate email format
            if (!empty($input->email)) {
                if (!preg_match('/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/', $input->email)) {
                    echo json_encode(['status' => 0, 'message' => 'Please enter a valid email address']);
                    exit;
                }
            }
            // Check for duplicate student number (excluding current student)
            $checkSql = "SELECT id FROM students WHERE student_number = :student_number AND id != :id";
            $checkStmt = $conn->prepare($checkSql);
            $checkStmt->bindParam(':student_number', $input->student_number);
            $checkStmt->bindParam(':id', $input->id);
            $checkStmt->execute();
            if ($checkStmt->fetch()) {
                error_log("[index.php][PUT] Duplicate student_number found for id: {$input->id}\n", 3, __DIR__ . '/error_log.txt');
                echo json_encode(['status' => 0, 'message' => 'Student number already exists']);
                exit;
            }
            error_log("[index.php][PUT] Checking for duplicate email for id: {$input->id}\n", 3, __DIR__ . '/error_log.txt');
            // Check for duplicate email (excluding current student)
            if (!empty($input->email)) {
                $emailCheckSql = "SELECT id FROM students WHERE email = :email AND id != :id";
                $emailCheckStmt = $conn->prepare($emailCheckSql);
                $emailCheckStmt->bindParam(':email', $input->email);
                $emailCheckStmt->bindParam(':id', $input->id);
                $emailCheckStmt->execute();
                if ($emailCheckStmt->fetch()) {
                    error_log("[index.php][PUT] Duplicate email found for id: {$input->id}\n", 3, __DIR__ . '/error_log.txt');
                    echo json_encode(['status' => 0, 'message' => 'Email address already exists']);
                    exit;
                }
            }
            error_log("[index.php][PUT] Passed duplicate checks for id: {$input->id}\n", 3, __DIR__ . '/error_log.txt');
            // Validate id_reason value
            $allowed_id_reasons = ['re_id', 'lost_id', 'masters_doctors_law'];
            if (!in_array($input->id_reason, $allowed_id_reasons, true)) {
                error_log("[index.php][PUT] Invalid ID reason: {$input->id_reason}\n", 3, __DIR__ . '/error_log.txt');
                echo json_encode(['status' => 0, 'message' => 'Invalid ID reason selected.']);
                exit;
            }

            if ($isFullUpdate) {
                if (empty($input->schedule_date)) {
                    echo json_encode(['status' => 0, 'message' => 'Schedule date is required']);
                    exit;
                }
                if (empty($input->schedule_time)) {
                    echo json_encode(['status' => 0, 'message' => 'Schedule time is required']);
                    exit;
                }
                $sql = "UPDATE students SET fullname = :fullname, student_number = :student_number, email = :email, id_reason = :id_reason, data_privacy_agreed = :data_privacy_agreed, schedule_date = :schedule_date, schedule_time = :schedule_time, status = :status WHERE id = :id";
                $stmt = $conn->prepare($sql);
                $stmt->bindParam(':fullname', $input->fullname);
                $stmt->bindParam(':student_number', $input->student_number);
                $stmt->bindParam(':email', $input->email);
                $stmt->bindParam(':id_reason', $input->id_reason);
                $stmt->bindParam(':data_privacy_agreed', $input->data_privacy_agreed);
                $stmt->bindParam(':schedule_date', $input->schedule_date);
                $stmt->bindParam(':schedule_time', $input->schedule_time);
                $stmt->bindParam(':status', $input->status);
                $stmt->bindParam(':id', $input->id);
            } else {
                $sql = "UPDATE students SET fullname = :fullname, student_number = :student_number, email = :email, id_reason = :id_reason WHERE id = :id";
                $stmt = $conn->prepare($sql);
                $stmt->bindParam(':fullname', $input->fullname);
                $stmt->bindParam(':student_number', $input->student_number);
                $stmt->bindParam(':email', $input->email);
                $stmt->bindParam(':id_reason', $input->id_reason);
                $stmt->bindParam(':id', $input->id);
            }

            if ($stmt->execute()) {
                $response = ['status' => 1, 'message' => 'Student updated successfully'];
            } else {
                $response = ['status' => 0, 'message' => 'Failed to update student'];
            }
            echo json_encode($response);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                if (strpos($e->getMessage(), 'email') !== false) {
                    echo json_encode(['status' => 0, 'message' => 'Email address already exists']);
                } elseif (strpos($e->getMessage(), 'student_number') !== false) {
                    echo json_encode(['status' => 0, 'message' => 'Student number already exists']);
                } else {
                    echo json_encode(['status' => 0, 'message' => 'Update failed. Please try again.']);
                }
            } else {
                echo json_encode(['status' => 0, 'message' => 'Update failed. Please try again.']);
            }
        } catch (Exception $e) {
            error_log("[index.php][PUT] " . $e->getMessage() . "\n", 3, __DIR__ . '/error_log.txt');
            echo json_encode(['status' => 0, 'message' => 'Internal server error']);
        }
        break;
    case "DELETE":
        try {
            $input = json_decode(file_get_contents('php://input'));
            $sql = "DELETE FROM students WHERE id = :id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':id', $input->id);
            if ($stmt->execute()) {
                $response = ['status' => 1, 'message' => 'Student deleted successfully'];
            } else {
                $response = ['status' => 0, 'message' => 'Failed to delete student'];
            }
            echo json_encode($response);
        } catch (Exception $e) {
            error_log("[index.php][DELETE] " . $e->getMessage() . "\n", 3, __DIR__ . '/error_log.txt');
            echo json_encode(['status' => 0, 'message' => 'Internal server error']);
        }
        break;
}
