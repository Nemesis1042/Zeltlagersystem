<?php
header('Content-Type: application/json');

$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    // GET /api/check-in/status/{id}
    if (preg_match('/^\/api\/check-in\/status\/(\d+)/', $request_uri, $matches) && $method === 'GET') {
        $participant_id = $matches[1];
        $camp_id = $_GET['camp_id'] ?? 1;

        $query = "SELECT id, participant_id, camp_id, checked_in, checked_in_at FROM check_ins WHERE participant_id = ? AND camp_id = ?";
        $result = $db->execute($query, [$participant_id, $camp_id]);

        if ($result && count($result) > 0) {
            echo json_encode($result[0]);
        } else {
            echo json_encode(['id' => null, 'participant_id' => $participant_id, 'camp_id' => $camp_id, 'checked_in' => 0, 'checked_in_at' => null]);
        }
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
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
