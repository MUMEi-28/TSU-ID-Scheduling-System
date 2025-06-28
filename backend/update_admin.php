<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

include 'config.php';

try {
    $json = file_get_contents('php://input');
    $input = json_decode($json);

    if (!isset($input->fullname) || !isset($input->student_number)) {
        throw new Exception("Full name and student number are required");
    }

    $sql = "UPDATE students SET fullname = :fullname, student_number = :student_number WHERE id = 1";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':fullname', $input->fullname);
    $stmt->bindParam(':student_number', $input->student_number);

    if ($stmt->execute()) {
        echo json_encode(['status' => 1, 'message' => 'Admin credentials updated']);
    } else {
        echo json_encode(['status' => 0, 'message' => 'Failed to update admin credentials']);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 0, 'message' => 'Error: ' . $e->getMessage()]);
}
