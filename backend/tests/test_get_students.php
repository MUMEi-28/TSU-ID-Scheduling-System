<?php
// Simple test for get_students.php endpoint
$url = 'http://localhost/Projects/TSU-ID-Scheduling-System/backend/get_students.php';
$result = file_get_contents($url);
echo "Get students endpoint response:\n";
echo $result; 