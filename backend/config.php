<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
header("Content-Type: application/json, Content-Type, Authorization");

/* <!-- DATABASE CONNECTION --> */
define('server', "localhost");
define('dbname', "tsuidschedule");
define('user', 'root');
define('password', '');

try {
    $conn = new PDO('mysql:host=' . server . '; dbname=' . dbname, user, password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (\Exception $e) {
    echo "Database Error: " . $e->getMessage();
}
