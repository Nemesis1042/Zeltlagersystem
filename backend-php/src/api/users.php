<?php
header('Content-Type: application/json');

$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $query = "SELECT id, vorname, nachname, email, role, created_at FROM users ORDER BY created_at DESC";
    $stmt = $db->execute($query, []);
    echo json_encode($stmt->fetchAll() ?: []);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
