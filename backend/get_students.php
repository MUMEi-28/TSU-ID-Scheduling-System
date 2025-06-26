<?php

include 'config.php';

$stmt = $conn->query("SELECT * FROM students ");
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($data);
