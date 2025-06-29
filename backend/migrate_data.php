<?php
/**
 * Migration script to normalize all existing slot_time and schedule_time data
 * Run this script once to ensure all data is in canonical format
 */

include 'config.php';
include 'utils.php';

echo "Starting data migration...\n";

try {
    // Normalize all slot_time values in slots table
    $slots = $conn->prepare("SELECT id, slot_time FROM slots WHERE slot_time IS NOT NULL");
    $slots->execute();
    $slotRows = $slots->fetchAll(PDO::FETCH_ASSOC);
    
    $updatedSlots = 0;
    foreach ($slotRows as $row) {
        $originalTime = $row['slot_time'];
        $normalizedTime = normalize_slot_time($originalTime);
        
        if ($originalTime !== $normalizedTime) {
            $updateSlot = $conn->prepare("UPDATE slots SET slot_time = :normalized_time WHERE id = :id");
            $updateSlot->execute([
                'normalized_time' => $normalizedTime,
                'id' => $row['id']
            ]);
            $updatedSlots++;
            echo "Updated slot ID {$row['id']}: '{$originalTime}' -> '{$normalizedTime}'\n";
        }
    }
    
    // Normalize all schedule_time values in students table
    $students = $conn->prepare("SELECT id, schedule_time FROM students WHERE schedule_time IS NOT NULL");
    $students->execute();
    $studentRows = $students->fetchAll(PDO::FETCH_ASSOC);
    
    $updatedStudents = 0;
    foreach ($studentRows as $row) {
        $originalTime = $row['schedule_time'];
        $normalizedTime = normalize_slot_time($originalTime);
        
        if ($originalTime !== $normalizedTime) {
            $updateStudent = $conn->prepare("UPDATE students SET schedule_time = :normalized_time WHERE id = :id");
            $updateStudent->execute([
                'normalized_time' => $normalizedTime,
                'id' => $row['id']
            ]);
            $updatedStudents++;
            echo "Updated student ID {$row['id']}: '{$originalTime}' -> '{$normalizedTime}'\n";
        }
    }
    
    // Normalize all schedule_date values in students table
    $studentsWithDates = $conn->prepare("SELECT id, schedule_date FROM students WHERE schedule_date IS NOT NULL");
    $studentsWithDates->execute();
    $studentDateRows = $studentsWithDates->fetchAll(PDO::FETCH_ASSOC);
    
    $updatedDates = 0;
    foreach ($studentDateRows as $row) {
        $originalDate = $row['schedule_date'];
        $normalizedDate = normalize_schedule_date($originalDate);
        
        if ($originalDate !== $normalizedDate) {
            $updateStudentDate = $conn->prepare("UPDATE students SET schedule_date = :normalized_date WHERE id = :id");
            $updateStudentDate->execute([
                'normalized_date' => $normalizedDate,
                'id' => $row['id']
            ]);
            $updatedDates++;
            echo "Updated student ID {$row['id']} date: '{$originalDate}' -> '{$normalizedDate}'\n";
        }
    }
    
    echo "\nMigration completed successfully!\n";
    echo "Updated {$updatedSlots} slot records\n";
    echo "Updated {$updatedStudents} student time records\n";
    echo "Updated {$updatedDates} student date records\n";
    
    // Verify data integrity
    echo "\nVerifying data integrity...\n";
    
    // Check for any remaining non-canonical times
    $canonicalSlots = get_canonical_time_slots();
    $canonicalSlotsStr = "'" . implode("','", $canonicalSlots) . "'";
    
    $invalidSlots = $conn->prepare("SELECT id, slot_time FROM slots WHERE slot_time NOT IN ({$canonicalSlotsStr}) AND slot_time IS NOT NULL");
    $invalidSlots->execute();
    $invalidSlotRows = $invalidSlots->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($invalidSlotRows) > 0) {
        echo "WARNING: Found " . count($invalidSlotRows) . " slots with non-canonical times:\n";
        foreach ($invalidSlotRows as $row) {
            echo "  Slot ID {$row['id']}: '{$row['slot_time']}'\n";
        }
    } else {
        echo "✓ All slot times are in canonical format\n";
    }
    
    $invalidStudents = $conn->prepare("SELECT id, schedule_time FROM students WHERE schedule_time NOT IN ({$canonicalSlotsStr}) AND schedule_time IS NOT NULL");
    $invalidStudents->execute();
    $invalidStudentRows = $invalidStudents->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($invalidStudentRows) > 0) {
        echo "WARNING: Found " . count($invalidStudentRows) . " students with non-canonical times:\n";
        foreach ($invalidStudentRows as $row) {
            echo "  Student ID {$row['id']}: '{$row['schedule_time']}'\n";
        }
    } else {
        echo "✓ All student times are in canonical format\n";
    }
    
} catch (Exception $e) {
    echo "Error during migration: " . $e->getMessage() . "\n";
    exit(1);
}

/**
 * Migration script to change id_reason from ENUM to VARCHAR(100) in students table
 * Run this script once after deployment to update the schema
 */

try {
    $sql = "ALTER TABLE students MODIFY id_reason VARCHAR(100) NOT NULL";
    $conn->exec($sql);
    echo "Migration successful: id_reason is now VARCHAR(100)\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
?> 