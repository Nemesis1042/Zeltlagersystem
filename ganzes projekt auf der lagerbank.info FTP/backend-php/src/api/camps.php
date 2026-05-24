<?php
header('Content-Type: application/json');

$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    // GET /api/camps/
    if ($request_uri === '/api/camps/' && $method === 'GET') {
        $query = "SELECT id, name, date_start, date_end, active FROM camps";
        $stmt = $db->execute($query, []);
        echo json_encode($stmt->fetchAll() ?: []);
        exit;
    }

    // GET /api/camps/{id}
    if (preg_match('/^\/api\/camps\/(\d+)/', $request_uri, $matches) && $method === 'GET') {
        $camp_id = $matches[1];
        $query = "SELECT id, name, date_start, date_end, active FROM camps WHERE id = ?";
        $stmt = $db->execute($query, [$camp_id]);
        $result = $stmt->fetch();
        echo json_encode($result ?: null);
        exit;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
