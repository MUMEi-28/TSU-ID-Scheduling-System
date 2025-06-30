<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';

$students = [];
$timeSlots = [
    '8:00am-9:00am',
    '9:00am-10:00am',
    '10:00am-11:00am',
    '11:00am-12:00pm',
    '1:00pm-2:00pm',
    '2:00pm-3:00pm',
    '3:00pm-4:00pm',
    '4:00pm-5:00pm'
];
$startDate = strtotime('2024-07-01');
$endDate = strtotime('2024-07-10');

$status = [
    'pending',
    'done',
    'cancelled'
];

$usedNumbers = [];
function generateUniqueStudentNumber(&$usedNumbers)
{
    do {
        $num = strval(rand(1000000000, 9999999999));
    } while (in_array($num, $usedNumbers));
    $usedNumbers[] = $num;
    return $num;
}

for ($i = 1; $i <= 10; $i++) {
    // Randomly decide if this student has a schedule
    $hasSchedule = rand(0, 1) === 1;
    $schedule_date = null;
    $schedule_time = null;
    if ($hasSchedule) {
        $randomTimestamp = rand($startDate, $endDate);
        $schedule_date = date('Y-m-d', $randomTimestamp);
        $schedule_date = normalize_schedule_date($schedule_date); // Ensure canonical format
        $schedule_time = $timeSlots[array_rand($timeSlots)];
        $schedule_time = normalize_slot_time($schedule_time); // Ensure canonical format
    }
    $student_number = generateUniqueStudentNumber($usedNumbers);
    $students[] = [
        'fullname' => "Test Student $i",
        'student_number' => $student_number,
        'email' => "teststudent$student_number@example.com",
        'id_reason' => 're_id',
        'data_privacy_agreed' => true,
        'status' => $status[rand(0, 2)],
        'schedule_date' => $schedule_date,
        'schedule_time' => $schedule_time
    ];
}

try {
    $stmt = $conn->prepare("INSERT INTO students (fullname, student_number, email, id_reason, data_privacy_agreed, status, schedule_date, schedule_time) VALUES (:fullname, :student_number, :email, :id_reason, :data_privacy_agreed, :status, :schedule_date, :schedule_time)");
    $insertedIds = [];
    foreach ($students as $student) {
        $stmt->execute($student);
        $insertedIds[] = $conn->lastInsertId();
        echo "Successfully added student: {$student['fullname']} (ID: " . $conn->lastInsertId() . ")\n";
        if ($student['schedule_date'] && $student['schedule_time']) {
            echo "  - Schedule: {$student['schedule_date']} {$student['schedule_time']}\n";
        } else {
            echo "  - No schedule assigned\n";
        }
    }
    echo "Inserted student IDs: " . implode(", ", $insertedIds) . "\n";
} catch (Exception $e) {
    echo "Error inserting students: " . $e->getMessage() . "\n";
}
