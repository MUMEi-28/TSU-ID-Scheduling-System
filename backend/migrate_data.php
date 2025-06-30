<?php
/**
 * Database Migration Script
 * This script handles database schema updates and data migrations
 */

include 'config.php';

echo "Starting database migration...\n";

try {
    // Check if database exists, create if not
    $pdo = new PDO("mysql:host=" . server, user, password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $pdo->exec("CREATE DATABASE IF NOT EXISTS " . dbname);
    echo "Database '" . dbname . "' is ready.\n";
    
    // Connect to the specific database
    $conn = new PDO('mysql:host=' . server . '; dbname=' . dbname, user, password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if students table exists
    $stmt = $conn->query("SHOW TABLES LIKE 'students'");
    $tableExists = $stmt->rowCount() > 0;
    
    if (!$tableExists) {
        echo "Creating students table...\n";
        
        // Create students table
        $sql = "CREATE TABLE students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            fullname VARCHAR(100) NOT NULL,
            student_number VARCHAR(30) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE,
            id_reason VARCHAR(100) NOT NULL,
            data_privacy_agreed BOOLEAN DEFAULT FALSE NOT NULL,
            schedule_date VARCHAR(30),
            schedule_time VARCHAR(30),
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            CONSTRAINT chk_student_number CHECK (LENGTH(student_number) = 10),
            CONSTRAINT chk_email_format CHECK (email IS NULL OR email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
            CONSTRAINT chk_schedule_consistency CHECK (
                (schedule_date IS NULL AND schedule_time IS NULL) OR 
                (schedule_date IS NOT NULL AND schedule_time IS NOT NULL)
            )
        )";
        
        $conn->exec($sql);
        echo "Students table created successfully.\n";
    } else {
        echo "Students table already exists. Checking for updates...\n";
        
        // Check if email column exists
        $stmt = $conn->query("SHOW COLUMNS FROM students LIKE 'email'");
        $emailExists = $stmt->rowCount() > 0;
        
        if (!$emailExists) {
            echo "Adding email column...\n";
            $conn->exec("ALTER TABLE students ADD COLUMN email VARCHAR(100) UNIQUE");
            echo "Email column added successfully.\n";
        }
        
        // Check if id_reason is ENUM and convert to VARCHAR if needed
        $stmt = $conn->query("SHOW COLUMNS FROM students WHERE Field = 'id_reason'");
        $columnInfo = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($columnInfo && strpos($columnInfo['Type'], 'enum') !== false) {
            echo "Converting id_reason from ENUM to VARCHAR...\n";
            $conn->exec("ALTER TABLE students MODIFY id_reason VARCHAR(100) NOT NULL");
            echo "id_reason column converted successfully.\n";
        }
        
        // Add email format constraint if it doesn't exist
        $stmt = $conn->query("SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                             WHERE TABLE_SCHEMA = '" . dbname . "' 
                             AND TABLE_NAME = 'students' 
                             AND CONSTRAINT_NAME = 'chk_email_format'");
        $constraintExists = $stmt->rowCount() > 0;
        
        if (!$constraintExists) {
            echo "Adding email format constraint...\n";
            $conn->exec("ALTER TABLE students ADD CONSTRAINT chk_email_format 
                        CHECK (email IS NULL OR email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')");
            echo "Email format constraint added successfully.\n";
        }
    }
    
    // Check if slots table exists
    $stmt = $conn->query("SHOW TABLES LIKE 'slots'");
    $slotsTableExists = $stmt->rowCount() > 0;
    
    if (!$slotsTableExists) {
        echo "Creating slots table...\n";
        
        $sql = "CREATE TABLE slots (
            id INT AUTO_INCREMENT PRIMARY KEY,
            slot_date VARCHAR(30) NOT NULL,
            slot_time VARCHAR(20) NOT NULL,
            booked_count INT DEFAULT 0 CHECK (booked_count >= 0),
            max_capacity INT DEFAULT 12 CHECK (max_capacity > 0),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            UNIQUE KEY unique_slot (slot_date, slot_time),
            CONSTRAINT chk_capacity CHECK (booked_count <= max_capacity)
        )";
        
        $conn->exec($sql);
        echo "Slots table created successfully.\n";
    }
    
    // Create indexes
    echo "Creating indexes...\n";
    $indexes = [
        "CREATE INDEX IF NOT EXISTS idx_student_number ON students(student_number)",
        "CREATE INDEX IF NOT EXISTS idx_student_email ON students(email)",
        "CREATE INDEX IF NOT EXISTS idx_student_fullname ON students(fullname)",
        "CREATE INDEX IF NOT EXISTS idx_student_status ON students(status)",
        "CREATE INDEX IF NOT EXISTS idx_student_schedule_date ON students(schedule_date)",
        "CREATE INDEX IF NOT EXISTS idx_student_schedule_time ON students(schedule_time)",
        "CREATE INDEX IF NOT EXISTS idx_student_schedule ON students(schedule_date, schedule_time)",
        "CREATE INDEX IF NOT EXISTS idx_student_status_date ON students(status, schedule_date)",
        "CREATE INDEX IF NOT EXISTS idx_slot_date ON slots(slot_date)",
        "CREATE INDEX IF NOT EXISTS idx_slot_time ON slots(slot_time)",
        "CREATE INDEX IF NOT EXISTS idx_slots_capacity ON slots(booked_count, max_capacity)",
        "CREATE INDEX IF NOT EXISTS idx_slots_date_time ON slots(slot_date, slot_time)"
    ];
    
    foreach ($indexes as $indexSql) {
        try {
            $conn->exec($indexSql);
        } catch (PDOException $e) {
            // Index might already exist, continue
        }
    }
    echo "Indexes created/verified successfully.\n";
    
    // Check if admin user exists
    $stmt = $conn->prepare("SELECT id FROM students WHERE id = 1");
    $stmt->execute();
    $adminExists = $stmt->fetch();
    
    if (!$adminExists) {
        echo "Creating admin user...\n";
        $adminSql = "INSERT INTO students (id, fullname, student_number, email, id_reason, data_privacy_agreed, schedule_date, schedule_time, status)
                     VALUES (1, 'admin', '1234512345', 'admin@tsu.edu.ph', 're_id', TRUE, NULL, NULL, 'done')";
        $conn->exec($adminSql);
        echo "Admin user created successfully.\n";
    } else {
        echo "Admin user already exists.\n";
    }
    
    // Create triggers if they don't exist
    echo "Creating triggers...\n";
    
    // Drop existing triggers if they exist
    $conn->exec("DROP TRIGGER IF EXISTS update_booked_count_insert");
    $conn->exec("DROP TRIGGER IF EXISTS update_booked_count_update");
    $conn->exec("DROP TRIGGER IF EXISTS update_booked_count_delete");
    
    // Create triggers
    $conn->exec("
        CREATE TRIGGER update_booked_count_insert
        AFTER INSERT ON students
        FOR EACH ROW
        BEGIN
            IF NEW.schedule_date IS NOT NULL AND NEW.schedule_time IS NOT NULL THEN
                INSERT INTO slots (slot_date, slot_time, booked_count, max_capacity)
                VALUES (NEW.schedule_date, NEW.schedule_time, 1, 12)
                ON DUPLICATE KEY UPDATE booked_count = booked_count + 1;
            END IF;
        END
    ");
    
    $conn->exec("
        CREATE TRIGGER update_booked_count_update
        AFTER UPDATE ON students
        FOR EACH ROW
        BEGIN
            IF OLD.schedule_date IS NOT NULL AND OLD.schedule_time IS NOT NULL THEN
                UPDATE slots 
                SET booked_count = GREATEST(0, booked_count - 1) 
                WHERE slot_date = OLD.schedule_date AND slot_time = OLD.schedule_time;
            END IF;
            
            IF NEW.schedule_date IS NOT NULL AND NEW.schedule_time IS NOT NULL THEN
                INSERT INTO slots (slot_date, slot_time, booked_count, max_capacity)
                VALUES (NEW.schedule_date, NEW.schedule_time, 1, 12)
                ON DUPLICATE KEY UPDATE booked_count = booked_count + 1;
            END IF;
        END
    ");
    
    $conn->exec("
        CREATE TRIGGER update_booked_count_delete
        AFTER DELETE ON students
        FOR EACH ROW
        BEGIN
            IF OLD.schedule_date IS NOT NULL AND OLD.schedule_time IS NOT NULL THEN
                UPDATE slots 
                SET booked_count = GREATEST(0, booked_count - 1) 
                WHERE slot_date = OLD.schedule_date AND slot_time = OLD.schedule_time;
            END IF;
        END
    ");
    
    echo "Triggers created successfully.\n";
    
    // DATA NORMALIZATION: Merge and normalize all slot_date and slot_time in slots
    require_once __DIR__ . '/utils.php';
    echo "Merging and normalizing all slot_date and slot_time in slots to canonical format...\n";
    // Step 1: Find all slots and group by normalized slot_date and slot_time
    $stmt = $conn->query("SELECT id, slot_date, slot_time, booked_count, max_capacity FROM slots WHERE slot_time IS NOT NULL AND slot_time != '' AND slot_date IS NOT NULL AND slot_date != ''");
    $allSlots = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $merged = [];
    foreach ($allSlots as $slot) {
        $norm_time = normalize_slot_time($slot['slot_time']);
        $norm_date = normalize_schedule_date($slot['slot_date']);
        $key = $norm_date . '|' . $norm_time;
        if (!isset($merged[$key])) {
            $merged[$key] = [
                'slot_date' => $norm_date,
                'slot_time' => $norm_time,
                'booked_count' => (int)$slot['booked_count'],
                'max_capacity' => (int)$slot['max_capacity'],
                'ids' => [$slot['id']]
            ];
        } else {
            $merged[$key]['booked_count'] += (int)$slot['booked_count'];
            $merged[$key]['max_capacity'] = max($merged[$key]['max_capacity'], (int)$slot['max_capacity']);
            $merged[$key]['ids'][] = $slot['id'];
        }
    }
    // Step 2: Delete all original slots that would be merged
    $allIds = [];
    foreach ($merged as $m) {
        $allIds = array_merge($allIds, $m['ids']);
    }
    if (count($allIds) > 0) {
        $in = implode(',', array_map('intval', $allIds));
        $conn->exec("DELETE FROM slots WHERE id IN ($in)");
    }
    // Step 3: Insert merged/normalized slots
    $insert = $conn->prepare("INSERT INTO slots (slot_date, slot_time, booked_count, max_capacity) VALUES (:slot_date, :slot_time, :booked_count, :max_capacity)");
    foreach ($merged as $m) {
        $insert->execute([
            'slot_date' => $m['slot_date'],
            'slot_time' => $m['slot_time'],
            'booked_count' => $m['booked_count'],
            'max_capacity' => $m['max_capacity']
        ]);
        echo "Inserted/merged slot: {$m['slot_date']} {$m['slot_time']} (booked: {$m['booked_count']}, max: {$m['max_capacity']})\n";
    }
    echo "Slot merging and normalization complete.\n";
    
    // DATA NORMALIZATION: Normalize all schedule_time in students and slot_time in slots
    require_once __DIR__ . '/utils.php';
    echo "Normalizing all schedule_time in students and slot_time in slots to canonical format...\n";
    // Normalize students.schedule_time
    $stmt = $conn->query("SELECT id, schedule_time FROM students WHERE schedule_time IS NOT NULL AND schedule_time != ''");
    $studentsToUpdate = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($studentsToUpdate as $student) {
        $normalized = normalize_slot_time($student['schedule_time']);
        if ($normalized !== $student['schedule_time']) {
            $update = $conn->prepare("UPDATE students SET schedule_time = :normalized WHERE id = :id");
            $update->execute(['normalized' => $normalized, 'id' => $student['id']]);
            echo "Updated student ID {$student['id']} schedule_time to $normalized\n";
        }
    }
    // Normalize slots.slot_time
    $stmt = $conn->query("SELECT id, slot_time FROM slots WHERE slot_time IS NOT NULL AND slot_time != ''");
    $slotsToUpdate = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($slotsToUpdate as $slot) {
        $normalized = normalize_slot_time($slot['slot_time']);
        if ($normalized !== $slot['slot_time']) {
            $update = $conn->prepare("UPDATE slots SET slot_time = :normalized WHERE id = :id");
            $update->execute(['normalized' => $normalized, 'id' => $slot['id']]);
            echo "Updated slot ID {$slot['id']} slot_time to $normalized\n";
        }
    }
    echo "Normalization complete.\n";
    
    // DATA NORMALIZATION: Normalize all schedule_date in students and slot_date in slots to canonical YYYY-MM-DD format
    echo "Normalizing all schedule_date in students and slot_date in slots to YYYY-MM-DD format...\n";
    // Normalize students.schedule_date
    $stmt = $conn->query("SELECT id, schedule_date FROM students WHERE schedule_date IS NOT NULL AND schedule_date != ''");
    $studentsToUpdate = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($studentsToUpdate as $student) {
        $normalized = normalize_schedule_date($student['schedule_date']);
        if ($normalized !== $student['schedule_date']) {
            $update = $conn->prepare("UPDATE students SET schedule_date = :normalized WHERE id = :id");
            $update->execute(['normalized' => $normalized, 'id' => $student['id']]);
            echo "Updated student ID {$student['id']} schedule_date to $normalized\n";
        }
    }
    // Normalize slots.slot_date
    $stmt = $conn->query("SELECT id, slot_date FROM slots WHERE slot_date IS NOT NULL AND slot_date != ''");
    $slotsToUpdate = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($slotsToUpdate as $slot) {
        $normalized = normalize_schedule_date($slot['slot_date']);
        if ($normalized !== $slot['slot_date']) {
            $update = $conn->prepare("UPDATE slots SET slot_date = :normalized WHERE id = :id");
            $update->execute(['normalized' => $normalized, 'id' => $slot['id']]);
            echo "Updated slot ID {$slot['id']} slot_date to $normalized\n";
        }
    }
    echo "Date normalization complete.\n";
    
    // Add a comment for developers:
    echo "\n[NOTE] To prevent future inconsistencies, always use normalize_slot_time() and normalize_schedule_date() before inserting or updating slot or schedule data in the backend.\n";
    
    echo "Database migration completed successfully!\n";
    
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    error_log("[migrate_data.php] Migration error: " . $e->getMessage() . "\n", 3, __DIR__ . '/error_log.txt');
}
?> 