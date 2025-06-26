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
        try {
            $input = json_decode(file_get_contents('php://input'));
            $sql = "INSERT INTO students (id, fullname, student_number, schedule_date, schedule_time, status) 
                    VALUES (null, :fullname, :student_number, null, null, null)";

            $stmt = $conn->prepare($sql);
            // $date = date.js idk yet

            $stmt->bindParam(':fullname', $input->fullname);
            $stmt->bindParam(':student_number', $input->student_number);

            if ($stmt->execute()) {
                $response = ['status' => 1, 'messsage' => 'Student Registered Successfully'];
            } else {
                $response = ['status' => 0, 'message' => 'Failed to register student'];
            }

            echo (json_encode($response));
            return (json_encode($response));
        } catch (Exception $e) {
            error_log("[index.php][POST] " . $e->getMessage() . "\n", 3, __DIR__ . '/error_log.txt');
            echo json_encode(['status' => 0, 'message' => 'Internal server error']);
        }
        break;
    case "PUT":
        try {
            $input = json_decode(file_get_contents('php://input'));
            $sql = "UPDATE students SET fullname = :fullname, student_number = :student_number, schedule_date = :schedule_date, schedule_time = :schedule_time, status = :status WHERE id = :id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':fullname', $input->fullname);
            $stmt->bindParam(':student_number', $input->student_number);
            $stmt->bindParam(':schedule_date', $input->schedule_date);
            $stmt->bindParam(':schedule_time', $input->schedule_time);
            $stmt->bindParam(':status', $input->status);
            $stmt->bindParam(':id', $input->id);
            if ($stmt->execute()) {
                $response = ['status' => 1, 'message' => 'Student updated successfully'];
            } else {
                $response = ['status' => 0, 'message' => 'Failed to update student'];
            }
            echo json_encode($response);
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
