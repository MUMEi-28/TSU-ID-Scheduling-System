<?php

require_once 'loadEnv.php';
loadEnv(); // Load variables from .env

class DbConnect
{
    private $server;
    private $dbname;
    private $user;
    private $pass;

    public function __construct()
    {
        $this->server = getenv('PHP_SERVER');
        $this->dbname = getenv('PHP_DATABASE_NAME');
        $this->user = getenv('PHP_USER');
        $this->pass = getenv('PHP_PASSWORD');
    }

    public function connect()
    {
        try {
            $conn = new PDO(
                "mysql:host={$this->server};dbname={$this->dbname}",
                $this->user,
                $this->pass
            );
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $conn;
        } catch (\Exception $e) {
            echo "Database Error: " . $e->getMessage();
        }
    }
}
