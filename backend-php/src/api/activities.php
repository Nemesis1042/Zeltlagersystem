<?php
header('Content-Type: application/json');

$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    // GET /api/activities/
    if ($request_uri === '/api/activities/' && $method === 'GET') {
        $camp_id = $_GET['camp_id'] ?? 1;
        $query = "SELECT id, camp_id, name, beschreibung, datum, uhrzeit, ort FROM activities WHERE camp_id = ? ORDER BY datum";
        $result = $db->execute($query, [$camp_id]);
        echo json_encode($result ?: []);
        exit;
    }

    // GET /api/activities/{id}
    if (preg_match('/^\/api\/activities\/(\d+)/', $request_uri, $matches) && $method === 'GET') {
        $activity_id = $matches[1];
        $query = "SELECT id, camp_id, name, beschreibung, datum, uhrzeit, ort FROM activities WHERE id = ?";
        $result = $db->execute($query, [$activity_id]);
        echo json_encode($result ? $result[0] : null);
        exit;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
