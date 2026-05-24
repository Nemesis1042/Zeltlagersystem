<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    $pdo = $db->getConnection();

    // GET /api/camps/
    if ($path === '/api/camps/' && $method === 'GET') {
        $stmt = $pdo->query("SELECT id, name, date_start, date_end, active FROM camps ORDER BY name");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC) ?: []);
        exit;
    }

    // GET /api/camps/{id}
    if (preg_match('/^\/api\/camps\/(\d+)/', $path, $m) && $method === 'GET') {
        $camp_id = (int)$m[1];
        $stmt = $pdo->prepare("SELECT id, name, date_start, date_end, active FROM camps WHERE id = ?");
        $stmt->execute([$camp_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$result) {
            http_response_code(404);
            echo json_encode(['error' => 'Camp not found']);
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
