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
switch ($method) {
    case "POST":
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

        break;
}
