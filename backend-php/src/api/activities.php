<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    $pdo = $db->getConnection();

    // GET /api/activities/
    if ($path === '/api/activities/' && $method === 'GET') {
        $camp_id = $_GET['camp_id'] ?? 1;
        $stmt = $pdo->prepare("SELECT id, camp_id, name, beschreibung, datum, uhrzeit, ort FROM activities WHERE camp_id = ? ORDER BY datum");
        $stmt->execute([$camp_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    // GET /api/activities/{id}
    if (preg_match('/^\/api\/activities\/(\d+)/', $path, $m) && $method === 'GET') {
        $stmt = $pdo->prepare("SELECT id, camp_id, name, beschreibung, datum, uhrzeit, ort FROM activities WHERE id = ?");
        $stmt->execute([$m[1]]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        exit;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
