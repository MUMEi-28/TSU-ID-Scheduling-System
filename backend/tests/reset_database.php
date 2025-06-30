<?php
require_once __DIR__ . '/../config.php';

try {
    // Delete all students except admin
    $deleted = $conn->exec("DELETE FROM students WHERE id != 1");
    echo "Deleted $deleted students (except admin).\n";

    // Reset students auto-increment
    $conn->exec("ALTER TABLE students AUTO_INCREMENT = 2");
    echo "Reset students table AUTO_INCREMENT to 2.\n";

    // Delete all slots
    $deletedSlots = $conn->exec("DELETE FROM slots");
    echo "Deleted $deletedSlots slots.\n";

    // Reset slots auto-increment
    $conn->exec("ALTER TABLE slots AUTO_INCREMENT = 1");
    echo "Reset slots table AUTO_INCREMENT to 1.\n";

    echo "Database reset to clean slate.\n";
} catch (Exception $e) {
    echo "Error resetting database: " . $e->getMessage() . "\n";
} 