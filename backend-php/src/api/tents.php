<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    $pdo = $db->getConnection();

    // GET /api/tents/
    if ($path === '/api/tents/' && $method === 'GET') {
        $camp_id = (int)($_GET['camp_id'] ?? 1);
        $stmt = $pdo->prepare("SELECT id, camp_id, name, kapazitaet, belegt FROM tents WHERE camp_id = ? ORDER BY name");
        $stmt->execute([$camp_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC) ?: []);
        exit;
    }

    // GET /api/tents/{id}
    if (preg_match('/^\/api\/tents\/(\d+)/', $path, $m) && $method === 'GET') {
        $tent_id = (int)$m[1];
        $stmt = $pdo->prepare("SELECT id, camp_id, name, kapazitaet, belegt FROM tents WHERE id = ?");
        $stmt->execute([$tent_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$result) {
            http_response_code(404);
            echo json_encode(['error' => 'Tent not found']);
            exit;
        }
        echo json_encode($result);
        exit;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
?>
