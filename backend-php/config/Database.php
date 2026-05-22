<?php
/**
 * Database Connection Manager
 * Singleton Pattern für PDO-Verbindung
 */

class Database {
    private static $instance = null;
    private $connection;

    private function __construct() {
        try {
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, array(
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ));
        } catch (PDOException $e) {
            die('Datenbankverbindung fehlgeschlagen: ' . $e->getMessage());
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->connection;
    }

    public function prepare($query) {
        return $this->connection->prepare($query);
    }

    public function execute($query, $params = array()) {
        $stmt = $this->prepare($query);
        $stmt->execute($params);
        return $stmt;
    }

    public function fetchOne($query, $params = array()) {
        $stmt = $this->execute($query, $params);
        return $stmt->fetch();
    }

    public function fetchAll($query, $params = array()) {
        $stmt = $this->execute($query, $params);
        return $stmt->fetchAll();
    }

    public function lastInsertId() {
        return $this->connection->lastInsertId();
    }
}
