<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    $pdo = $db->getConnection();

    // GET /api/users/
    if ($path === '/api/users/' && $method === 'GET') {
        $stmt = $pdo->query("SELECT id, vorname, nachname, email, role FROM users ORDER BY vorname");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    // GET /api/users/{id}
    if (preg_match('/^\/api\/users\/(\d+)/', $path, $m) && $method === 'GET') {
        $stmt = $pdo->prepare("SELECT id, vorname, nachname, email, role FROM users WHERE id = ?");
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
