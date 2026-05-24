<?php
header('Content-Type: application/json');

$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// GET /api/check-in/status/{id}
if (preg_match('/^\/api\/check-in\/status\/(\d+)/', $request_uri, $matches) && $method === 'GET') {
    $participant_id = $matches[1];
    $query = "SELECT id, participant_id, camp_id, checked_in, checked_in_at FROM check_ins WHERE participant_id = ? LIMIT 1";
    $result = $db->execute($query, [$participant_id]);
    echo json_encode($result ? $result[0] : null);
    exit;
}

// GET /api/check-in/
if ($request_uri === '/api/check-in/' && $method === 'GET') {
    $camp_id = $_GET['camp_id'] ?? 1;
    $query = "SELECT id, participant_id, camp_id, checked_in, checked_in_at FROM check_ins WHERE camp_id = ?";
    $result = $db->execute($query, [$camp_id]);
    echo json_encode($result ?: []);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
