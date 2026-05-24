<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    $pdo = $db->getConnection();

    // GET /api/participants/
    if ($path === '/api/participants/' && $method === 'GET') {
        $camp_id = $_GET['camp_id'] ?? 1;
        $stmt = $pdo->prepare("SELECT id, camp_id, vorname, nachname, `alter`, geschlecht, kontakt_name, kontakt_email, kontakt_tel, guthaben, checked_in, checked_in_at FROM participants WHERE camp_id = ? ORDER BY vorname");
        $stmt->execute([$camp_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    // GET /api/participants/{id}
    if (preg_match('/^\/api\/participants\/(\d+)/', $path, $m) && $method === 'GET') {
        $stmt = $pdo->prepare("SELECT id, camp_id, vorname, nachname, `alter`, geschlecht, kontakt_name, kontakt_email, kontakt_tel, guthaben, checked_in, checked_in_at FROM participants WHERE id = ?");
        $stmt->execute([$m[1]]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($result ?: null);
        exit;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
