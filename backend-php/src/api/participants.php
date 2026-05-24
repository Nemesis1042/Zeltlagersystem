<?php
header('Content-Type: application/json');

$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    // GET /api/participants/
    if ($request_uri === '/api/participants/' && $method === 'GET') {
        $camp_id = $_GET['camp_id'] ?? 1;
        $query = "SELECT id, camp_id, vorname, nachname, `alter`, geschlecht, kontakt_name, kontakt_email, kontakt_tel, guthaben, checked_in, checked_in_at FROM participants WHERE camp_id = ?";
        $stmt = $db->execute($query, [$camp_id]);
        echo json_encode($stmt->fetchAll() ?: []);
        exit;
    }

    // GET /api/participants/{id}
    if (preg_match('/^\/api\/participants\/(\d+)/', $request_uri, $matches) && $method === 'GET') {
        $participant_id = $matches[1];
        $query = "SELECT id, camp_id, vorname, nachname, `alter`, geschlecht, kontakt_name, kontakt_email, kontakt_tel, guthaben, checked_in, checked_in_at FROM participants WHERE id = ?";
        $stmt = $db->execute($query, [$participant_id]);
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
