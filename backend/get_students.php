<?php

include 'config.php';

// --- Rate Limiting ---
$ip = $_SERVER['REMOTE_ADDR'];
$rateFile = sys_get_temp_dir() . "/tsu_rate_" . md5($ip) . "_get_students";
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
    error_log("[get_students.php] Rate limit exceeded for $ip", 3, __DIR__ . '/error_log.txt');
    exit;
}

try {
    $stmt = $conn->query("SELECT * FROM students ");
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($data);
} catch (Exception $e) {
    error_log("[get_students.php] " . $e->getMessage() . "\n", 3, __DIR__ . '/error_log.txt');
    echo json_encode(["error" => "Internal server error"]);
}
