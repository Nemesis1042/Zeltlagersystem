<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    $pdo = $db->getConnection();

    // GET /api/check-in/status/{id}
    if (preg_match('/^\/api\/check-in\/status\/(\d+)/', $path, $m) && $method === 'GET') {
        $participant_id = $m[1];
        $camp_id = $_GET['camp_id'] ?? 1;

        $stmt = $pdo->prepare("SELECT id, participant_id, camp_id, checked_in, checked_in_at FROM check_ins WHERE participant_id = ? AND camp_id = ?");
        $stmt->execute([$participant_id, $camp_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode($result ?: ['id' => null, 'participant_id' => $participant_id, 'camp_id' => $camp_id, 'checked_in' => 0, 'checked_in_at' => null]);
        exit;
    }

    // GET /api/check-in/
    if ($path === '/api/check-in/' && $method === 'GET') {
        $camp_id = $_GET['camp_id'] ?? 1;
        $stmt = $pdo->prepare("SELECT id, participant_id, camp_id, checked_in, checked_in_at FROM check_ins WHERE camp_id = ?");
        $stmt->execute([$camp_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
